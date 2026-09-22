/* Inject into a built page, then await window.__browserSelftest().
   Exercises the actual controls; this file is not part of the published page. */
(function () {
  "use strict";

  window.__browserSelftest = async function () {
    var failures = [], checks = 0;
    var originalURL = location.href;
    var originalPanel = document.documentElement.getAttribute("data-panel");
    var originalFocus = document.activeElement;
    var side = document.querySelector(".v-side");
    var toggle = document.querySelector(".v-toggle");
    var hide = document.querySelector(".v-hide");
    var field = document.querySelector(".v-q");
    var storedPanel = null, storedTheme = null, storageAvailable = false;
    try { storedPanel = localStorage.getItem("resume-panel"); } catch (e) {}
    try {
      storedTheme = localStorage.getItem("theme");
      storageAvailable = true;
    } catch (e) {}

    function assert(value, message) {
      if (!value) throw new Error(message);
    }

    async function check(name, run) {
      checks++;
      try { await run(); }
      catch (e) { failures.push({ name: name, message: String(e.message || e) }); }
    }

    function settle() {
      return new Promise(function (resolve) { setTimeout(resolve, 300); });
    }

    function panel(open) {
      var isOpen = document.documentElement.getAttribute("data-panel") === "open";
      if (open !== isOpen) (open ? toggle : hide).click();
    }

    function search(value) {
      field.value = value;
      field.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function sheet() {
      return document.querySelector(".sheet").innerHTML;
    }

    function assertSearch(value, expectedSheet) {
      assert(field.value === value, "search field does not match the selected state");
      assert((new URLSearchParams(location.search).get("q") || "") === value,
        "URL contains a stale search");
      assert(sheet() === expectedSheet, "rendered resume reverted to a stale search");
    }

    try {
      await check("customization stays optional and its trigger has one accessible target", function () {
        assert(originalPanel === "closed", "fresh browser opened customization by default");
        assert(document.querySelectorAll(".v-toggle").length === 1,
          "more than one customization trigger exists");
        assert(toggle.textContent === "Customize", "customization trigger has an unclear label");
        assert(toggle.getAttribute("aria-controls") === side.id, "trigger points to a missing panel");
        assert(side.inert, "closed panel controls remain keyboard-accessible");
        var target = document.querySelector("[data-resume-controls]");
        if (target) assert(target.contains(toggle), "trigger is missing from the toolbar");
      });
      await check("Save as PDF is available without opening customization", function () {
        var button = document.querySelector('.resume-save[data-download="pdf"]');
        assert(button && !button.hidden && button.getClientRects().length > 0,
          "the toolbar PDF action is not visible");
        var originalPrint = window.print, calls = 0;
        try {
          window.print = function () { calls++; };
          button.click();
          assert(calls === 1, "the toolbar PDF action did not invoke printing");
          assert(document.documentElement.getAttribute("data-panel") === "closed",
            "saving a PDF unexpectedly opened customization");
        } finally { window.print = originalPrint; }
      });
      panel(true);
      window.__versions.apply({});
      var baseline = sheet();

      await check("layout links survive navigation and Reset restores the source layout", function () {
        var defaultLayout = document.documentElement.getAttribute("data-layout");
        var chosen = defaultLayout === "plain" ? "column" : "plain";
        document.querySelector('[data-group="layout"][data-value="' + chosen + '"]').click();
        assert(new URLSearchParams(location.search).get("lay") === chosen,
          "selected layout is missing from the shared URL");
        var sharedURL = location.href;
        document.querySelector('[data-group="reset"]').click();
        assert(document.documentElement.getAttribute("data-layout") === defaultLayout,
          "Reset retained the selected layout instead of the source default");
        assert(!new URLSearchParams(location.search).has("lay"), "Reset retained the layout parameter");
        history.replaceState(null, "", sharedURL);
        window.dispatchEvent(new PopStateEvent("popstate"));
        assert(document.documentElement.getAttribute("data-layout") === chosen,
          "shared URL did not restore the chosen layout");
        assert(new URLSearchParams(location.search).get("lay") === chosen,
          "rendering erased the layout from the shared URL");
        document.querySelector('[data-group="reset"]').click();
      });

      await check("typing applies a search after the debounce", async function () {
        search("gradle");
        await settle();
        assert(field.value === "gradle", "search field lost the entered text");
        assert(new URLSearchParams(location.search).get("q") === "gradle",
          "typing did not update the URL");
        assert(sheet() !== baseline, "typing did not filter the resume");
        assert(document.querySelector(".sheet mark"), "search did not highlight a match");
      });

      await check("Reset cancels a pending search", async function () {
        window.__versions.apply({});
        search("gradle");
        document.querySelector('[data-group="reset"]').click();
        await settle();
        assertSearch("", baseline);
      });

      await check("history navigation cancels a pending search", async function () {
        window.__versions.apply({ q: "kotlin" });
        var targetURL = location.href, targetSheet = sheet();
        window.__versions.apply({});
        search("gradle");
        history.replaceState(null, "", targetURL);
        window.dispatchEvent(new PopStateEvent("popstate"));
        await settle();
        assertSearch("kotlin", targetSheet);
      });

      await check("external configuration cancels a pending search", async function () {
        window.__versions.apply({ q: "kotlin" });
        var targetSheet = sheet();
        search("gradle");
        window.__versions.apply({ q: "kotlin" });
        await settle();
        assertSearch("kotlin", targetSheet);
      });

      await check("React Native topic keeps its matching highlight", function () {
        window.__versions.apply({ len: "full", hide: [] });
        var highlights = Array.from(document.querySelectorAll(".hi ul > li"));
        var upgrade = highlights.find(function (li) {
          return li.textContent.indexOf("0.72.3") >= 0;
        });
        assert(upgrade, "the React Native upgrade highlight is missing from the full resume");
        var expected = upgrade.textContent;
        document.querySelector('[data-group="topic"][data-value="rn"]').click();
        assert(Array.from(document.querySelectorAll(".hi ul > li")).some(function (li) {
          return li.textContent === expected;
        }), "the React Native topic removed its matching upgrade highlight");
      });

      await check("one-page resume includes evidence for every listed role", function () {
        window.__versions.apply({ len: "one", hide: [] });
        document.querySelectorAll("article.role").forEach(function (role) {
          assert(role.querySelector(".bullets li"),
            role.querySelector(".org").textContent + " has no achievement on the one-page resume");
        });
      });

      await check("Close returns focus to Customize and disables hidden controls", function () {
        panel(true);
        hide.focus();
        hide.click();
        assert(document.activeElement === toggle, "Close left focus inside the closed panel");
        assert(toggle.getAttribute("aria-expanded") === "false", "Customize reports an open panel");
        var controls = side.querySelectorAll("button, input");
        for (var i = 0; i < controls.length; i++) {
          controls[i].focus();
          assert(!side.contains(document.activeElement),
            "a hidden panel control can still receive keyboard focus");
        }
      });

      await check("opening the panel moves focus to an available control", function () {
        panel(false);
        toggle.focus();
        toggle.click();
        assert(document.activeElement === hide, "Customize did not move focus into the panel");
        assert(toggle.getAttribute("aria-expanded") === "true", "Customize reports a closed panel");
        field.focus();
        assert(document.activeElement === field, "reopened panel controls remain disabled");
      });

      await check("Escape closes the panel and restores visible focus", function () {
        panel(true);
        field.focus();
        field.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        assert(document.documentElement.getAttribute("data-panel") === "closed",
          "Escape did not close the panel");
        assert(document.activeElement === toggle, "Escape left focus inside the closed panel");
        field.focus();
        assert(document.activeElement !== field, "Escape left hidden controls focusable");
      });

      await check("mobile customization is modal and desktop customization remains nonmodal", function () {
        panel(true);
        var mobile = !window.matchMedia("(min-width:1180px)").matches;
        assert((side.getAttribute("aria-modal") === "true") === mobile,
          "customization has the wrong modal state for this viewport");
        var regions = document.querySelectorAll(
          ".resume-site-header, .resume-main, .resume-site-footer");
        regions.forEach(function (region) {
          assert(region.inert === mobile, "page content has the wrong inert state");
        });
        if (mobile) {
          assert(side.getAttribute("role") === "dialog", "mobile panel is not a dialog");
          var controls = Array.from(side.querySelectorAll("button, input"))
            .filter(function (item) { return !item.disabled && item.getClientRects().length > 0; });
          var first = controls[0], last = controls[controls.length - 1];
          first.focus();
          first.dispatchEvent(new KeyboardEvent("keydown", {
            key: "Tab", shiftKey: true, bubbles: true, cancelable: true
          }));
          assert(document.activeElement === last, "Shift+Tab escaped the dialog");
          last.dispatchEvent(new KeyboardEvent("keydown", {
            key: "Tab", bubbles: true, cancelable: true
          }));
          assert(document.activeElement === first, "Tab escaped the dialog");
        }
        panel(false);
        regions.forEach(function (region) {
          assert(!region.inert, "closing customization left page content inert");
        });
      });

      await check("masked contact details can be revealed with Enter and Space", function () {
        panel(false);
        ["Enter", " "].forEach(function (key, index) {
          window.__versions.apply({});
          var contacts = document.querySelectorAll(".contact li[data-real]");
          var item = contacts[index];
          assert(item && item.getAttribute("role") === "button" && item.tabIndex === 0,
            "masked contact has no keyboard-accessible control");
          assert(/^Show (email address|phone number)$/.test(item.getAttribute("aria-label")),
            "masked contact has no descriptive accessible name");
          item.focus();
          assert(document.activeElement === item, "masked contact cannot receive focus");
          var event = new KeyboardEvent("keydown", { key: key, bubbles: true, cancelable: true });
          item.dispatchEvent(event);
          assert(event.defaultPrevented, "contact reveal did not prevent the key's default action");
          assert(!document.querySelector(".contact li[data-real]"), "keyboard action did not reveal contacts");
          assert(new URLSearchParams(location.search).get("contact") === "show",
            "keyboard contact reveal did not update the shared URL");
          assert(document.activeElement.closest(".contact"),
            "revealing contact details lost keyboard focus");
          var downloaded = new DOMParser().parseFromString(window.__versions.page(), "text/html");
          assert(!downloaded.querySelector('.contact [role="button"], [data-resume-focus]'),
            "temporary contact controls leaked into the downloaded resume");
        });
      });

      await check("section navigation moves keyboard focus to the selected content", function () {
        window.__versions.apply({});
        panel(true);
        var jump = document.querySelector('.v-jump[data-value="1"]');
        assert(jump, "resume has no section navigation target");
        jump.focus();
        jump.click();
        assert(document.querySelector(".sheet").contains(document.activeElement),
          "section navigation left focus in customization");
        assert(document.activeElement.matches("h2, h3"),
          "section navigation did not focus the destination heading");
        if (!window.matchMedia("(min-width:1180px)").matches) {
          assert(document.documentElement.getAttribute("data-panel") === "closed",
            "mobile section navigation left the modal panel open");
        }
        panel(false);
      });

      await check("website theme follows shared preferences without changing print defaults", function () {
        window.__versions.apply({});
        window.dispatchEvent(new StorageEvent("storage", { key: "theme", newValue: "light" }));
        assert(document.documentElement.getAttribute("data-site-theme") === "light",
          "website palette ignored a shared light preference");
        assert(!document.documentElement.hasAttribute("data-theme"),
          "website palette changed the explicit print theme");
        assert(!new URLSearchParams(location.search).has("theme"),
          "website preference leaked into a shared URL");
        window.dispatchEvent(new StorageEvent("storage", { key: "theme", newValue: "dark" }));
        assert(document.documentElement.getAttribute("data-site-theme") === "dark",
          "website palette ignored a shared dark preference");
      });

      await check("explicit palette wins after shared storage updates, Reset and navigation", function () {
        panel(true);
        document.querySelector('[data-group="theme"][data-value="terminal"]').click();
        var themedURL = location.href;
        window.dispatchEvent(new StorageEvent("storage", { key: "theme", newValue: "light" }));
        assert(document.documentElement.getAttribute("data-theme") === "terminal",
          "shared storage replaced an explicit terminal palette");
        document.querySelector('[data-group="reset"]').click();
        assert(!document.documentElement.hasAttribute("data-theme"),
          "Reset did not restore the website palette");
        assert(!new URLSearchParams(location.search).has("theme"), "Reset left a stale theme URL");
        history.replaceState(null, "", themedURL);
        window.dispatchEvent(new PopStateEvent("popstate"));
        assert(document.documentElement.getAttribute("data-theme") === "terminal",
          "history navigation lost the explicit terminal palette");
        var button = document.querySelector("[data-theme-toggle]");
        if (button) assert(button.getAttribute("aria-label") === "Switch to light theme",
          "header theme label did not follow the explicit palette");
      });

      await check("header and panel light/dark choices persist and keep shared URLs explicit", function () {
        panel(false);
        var button = document.querySelector("[data-theme-toggle]");
        if (button) {
          window.__versions.apply({ theme: "dark" });
          button.click();
          assert(document.documentElement.getAttribute("data-theme") === "light",
            "header toggle did not select light");
          assert(new URLSearchParams(location.search).get("theme") === "light",
            "header selection is missing from the shared URL");
          if (storageAvailable) assert(localStorage.getItem("theme") === "light",
            "header choice was not saved for the rest of the website");
        }
        panel(true);
        document.querySelector('[data-group="theme"][data-value="dark"]').click();
        assert(new URLSearchParams(location.search).get("theme") === "dark",
          "panel selection is missing from the shared URL");
        if (storageAvailable) assert(localStorage.getItem("theme") === "dark",
          "panel choice was not saved for the rest of the website");
      });

      await check("theme choices remain usable when browser storage is blocked", function () {
        var descriptor = Object.getOwnPropertyDescriptor(window, "localStorage");
        try {
          Object.defineProperty(window, "localStorage", {
            configurable: true,
            get: function () { throw new Error("Storage blocked for this test"); }
          });
          panel(true);
          document.querySelector('[data-group="theme"][data-value="light"]').click();
          assert(document.documentElement.getAttribute("data-theme") === "light",
            "blocked storage prevented an in-page theme change");
          document.querySelector('[data-group="reset"]').click();
          assert(document.documentElement.getAttribute("data-site-theme") === "light",
            "Reset lost the current visit's theme when storage was blocked");
        } finally {
          if (descriptor) Object.defineProperty(window, "localStorage", descriptor);
          else delete window.localStorage;
        }
      });

      await check("Copy link announces actual success and gives a readable failure fallback", async function () {
        var descriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
        var button = document.querySelector('[data-group="copy"]');
        var status = document.querySelector(".v-copy-status"), copied = "";
        try {
          panel(true);
          Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: { writeText: function (value) { copied = value; return Promise.resolve(); } }
          });
          button.click();
          await new Promise(function (resolve) { setTimeout(resolve, 0); });
          assert(copied === location.href && status.textContent === "Link copied.",
            "copy success was not tied to the clipboard result");
          Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: { writeText: function () { return Promise.reject(new Error("Permission denied")); } }
          });
          button.click();
          await new Promise(function (resolve) { setTimeout(resolve, 0); });
          assert(status.textContent.indexOf(location.href) >= 0,
            "clipboard failure did not provide the address");
          assert(status.getAttribute("role") === "status" && !button.disabled,
            "clipboard failure was inaccessible or left the button disabled");
          assert(status.textContent.indexOf("copied") < 0,
            "clipboard failure incorrectly reported success");
        } finally {
          if (descriptor) Object.defineProperty(navigator, "clipboard", descriptor);
          else delete navigator.clipboard;
          status.textContent = "";
        }
      });

      await check("downloaded HTML contains the resume without website navigation or controls", function () {
        var page = window.__versions.page();
        var doc = new DOMParser().parseFromString(page, "text/html");
        assert(doc.querySelector(".sheet"), "downloaded page lost the resume");
        assert(!doc.querySelector(".resume-site-header, .resume-site-footer, .resume-tools, .v-ui"),
          "website chrome leaked into the downloaded resume");
        assert(!doc.querySelector("script, [data-real], [data-t], [inert]"),
          "downloaded resume contains runtime scripts or hidden source annotations");
      });
    } finally {
      try {
        if (storedTheme === null) localStorage.removeItem("theme");
        else localStorage.setItem("theme", storedTheme);
      } catch (e) {}
      window.dispatchEvent(new StorageEvent("storage", { key: "theme", newValue: storedTheme }));
      history.replaceState(null, "", originalURL);
      window.dispatchEvent(new PopStateEvent("popstate"));
      panel(originalPanel === "open");
      try {
        if (storedPanel === null) localStorage.removeItem("resume-panel");
        else localStorage.setItem("resume-panel", storedPanel);
      } catch (e) {}
      if (originalFocus && originalFocus.isConnected) originalFocus.focus({ preventScroll: true });
    }
    return { checks: checks, failures: failures };
  };
})();
