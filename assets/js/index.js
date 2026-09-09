/**
 * Main JS file for GhostScroll behaviours
 */

var $post = $(".post");
var $first = $(".post.first");
var $last = $(".post.last");
var $fnav = $(".fixed-nav");
var $postholder = $(".post-holder");
var $sitehead = $("#site-head");

/* Globals jQuery, document */
(function ($) {
  "use strict";
  function srcTo(el, dur = 1000) {
    $("html, body").animate(
      {
        scrollTop: el.offset().top,
      },
      dur,
      function() {
        window.location.hash = el.attr("id");
      }
    );
  }
  function srcToAnchorWithTitle(str) {
    var $el = $("#" + str);
    if ($el.length) {
      srcTo($el);
    }
  }
  $(document).ready(function () {
    // Cover arrow button smooth scroll
    $("#header-arrow").on("click", function (e) {
      e.preventDefault();
      var $target = $(".post.first");
      if (!$target.length) {
        $target = $(".post").first();
      }
      if ($target.length) {
        var offsetTop = $target.offset().top - 60;
        $("html, body").stop().animate({ scrollTop: offsetTop }, 650);
      }
    });

    // Cover menu buttons smooth scroll
    $("a.btn.site-menu").on("click", function (e) {
      var anchor = $(this).data("title-anchor");
      if (anchor) {
        var $el = $("#" + anchor);
        if ($el.length) {
          e.preventDefault();
          var offsetTop = $el.offset().top - 60;
          $("html, body").stop().animate({ scrollTop: offsetTop }, 650);
        }
      }
    });

    $(".post.last").next(".post-after").hide();

    if ($sitehead.length) {
      $(window).scroll(function () {
        var w = $(window).scrollTop();
        var g = $sitehead.offset().top;
        var h = $sitehead.offset().top + $sitehead.height() - 100;

        if (w >= Math.floor(g) && w <= Math.ceil(h)) {
          $(".fixed-nav").fadeOut("fast");
        } else {
          $(".fixed-nav").css("display", "flex").fadeIn("fast");
        }

        var isNearBottom = ($(window).height() + w) >= ($(document).height() - $(".site-footer").height() - 40);

        if (isNearBottom) {
          var $lastNav = $(".fn-item").not("[href*='site-head']").last();
          if ($lastNav.length && !$lastNav.hasClass("active")) {
            $(".fn-item").removeClass("active");
            $lastNav.addClass("active");
            if ($lastNav[0] && typeof $lastNav[0].scrollIntoView === "function") {
              $lastNav[0].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
            }
          }
        } else {
          var activeIndex = null;
          $(".post[data-item-index]").each(function () {
            var f = $(this).offset().top - 90;
            var b = f + $(this).outerHeight();
            var a = $(this)
              .parent(".post-holder")
              .prev(".post-holder")
              .find(".post-after");

            if (w >= f && w < b) {
              activeIndex = $(this).attr("data-item-index");
              a.fadeOut("slow");
            } else {
              a.fadeIn("slow");
            }
          });

          if (activeIndex) {
            var $activeItem = $(".fn-item[data-item-index='" + activeIndex + "']");
            if ($activeItem.length && !$activeItem.hasClass("active")) {
              $(".fn-item").removeClass("active");
              $activeItem.addClass("active");
              if ($activeItem[0] && typeof $activeItem[0].scrollIntoView === "function") {
                $activeItem[0].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
              }
            }
          }
        }
      });

      $(".fn-item").on("click", function (e) {
        var $btn = $(this);
        var itemIdx = $btn.attr("data-item-index");
        var href = $btn.attr("href");

        if (href === "./#site-head" || href === "#site-head") {
          e.preventDefault();
          $(".fn-item").removeClass("active");
          $btn.addClass("active");
          $("html, body").stop().animate({ scrollTop: 0 }, 650);
          return;
        }

        if (itemIdx) {
          var $targetPost = $(".post[data-item-index='" + itemIdx + "']");
          if ($targetPost.length) {
            e.preventDefault();
            $(".fn-item").removeClass("active");
            $btn.addClass("active");
            if (this.scrollIntoView) {
              this.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
            }
            var offsetTop = $targetPost.offset().top - 60;
            $("html, body").stop().animate({ scrollTop: offsetTop }, 500);
            return;
          }
        }

        if (this.scrollIntoView) {
          this.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
      });
    }

    var ulLiIcon = getComputedStyle(document.documentElement).getPropertyValue('--ul-li-icon');
    if (ulLiIcon.length > 0) {
      $('ul').addClass("fa-ul");
      $("ul li").prepend('<span class="fa-li"><i class="fa ' + ulLiIcon + '"></i></span>');
    }
    $("blockquote p").prepend('<span class="quo fa fa-quote-left"></span>');
    $("blockquote p").append('<span class="quo fa fa-quote-right"></span>');

    // ========== Instant Menu Search & Filter ==========
    var $searchInput = $("#menu-search-input");
    var $clearBtn = $("#menu-search-clear");
    var $filterChips = $(".filter-chip");
    var $noResults = $("#search-no-results");
    var $resetBtn = $("#search-reset-btn");
    var activeFilter = "all";

    // Fixed Top Nav Search Elements
    var $fixedNavSearchBtn = $("#fixed-nav-search-btn");
    var $fixedNavWrapper = $(".fixed-nav-wrapper");
    var $fixedNavSearchBar = $("#fixed-nav-search-bar");
    var $fixedSearchInput = $("#fixed-menu-search-input");
    var $fixedClearBtn = $("#fixed-menu-search-clear");
    var $fixedCloseBtn = $("#fixed-nav-search-close");

    function normalizeText(str) {
      if (!str) return "";
      return str.toString()
        .toLowerCase()
        .replace(/[\u064B-\u065F\u0670]/g, "") // remove arabic diacritics
        .replace(/ي/g, "ی")
        .replace(/ك/g, "ک")
        .replace(/ة/g, "ه")
        .replace(/آ/g, "ا")
        .replace(/أ/g, "ا")
        .replace(/إ/g, "ا")
        .trim();
    }

    function filterMenu() {
      var rawQuery = ($searchInput.val() || "");
      var query = normalizeText(rawQuery);

      if (rawQuery.length > 0) {
        $clearBtn.show();
        $fixedClearBtn.show();
        $fixedNavSearchBtn.addClass("has-query");
      } else {
        $clearBtn.hide();
        $fixedClearBtn.hide();
        if (activeFilter === "all") {
          $fixedNavSearchBtn.removeClass("has-query");
        }
      }

      var totalVisibleItems = 0;
      var isFiltering = query.length > 0 || activeFilter !== "all";

      $(".post-holder").each(function () {
        var $holder = $(this);
        var $grid = $holder.find(".menu-items-grid");

        // If this section has no menu items (e.g. contact section)
        if (!$grid.length) {
          if (isFiltering) {
            $holder.hide();
          } else {
            $holder.show();
          }
          return;
        }

        var visibleInCategory = 0;

        $grid.find(".menu-item-card").each(function () {
          var $card = $(this);
          var name = normalizeText($card.attr("data-name") || "");
          var desc = normalizeText($card.attr("data-desc") || "");
          var ingredients = normalizeText($card.attr("data-ingredients") || "");
          var isSpecial = ($card.attr("data-special") === "true");
          var isVegan = ($card.attr("data-vegan") === "true");

          var matchesQuery = true;
          if (query.length > 0) {
            matchesQuery = name.indexOf(query) !== -1 ||
                           desc.indexOf(query) !== -1 ||
                           ingredients.indexOf(query) !== -1;
          }

          var matchesChip = true;
          if (activeFilter === "special") {
            matchesChip = isSpecial;
          } else if (activeFilter === "vegan") {
            matchesChip = isVegan;
          }

          if (matchesQuery && matchesChip) {
            $card.show();
            visibleInCategory++;
            totalVisibleItems++;
          } else {
            $card.hide();
          }
        });

        if (visibleInCategory > 0) {
          $holder.show();
        } else {
          $holder.hide();
        }
      });

      if (totalVisibleItems === 0 && isFiltering) {
        $noResults.fadeIn("fast");
      } else {
        $noResults.hide();
      }
    }

    // Toggle Fixed Nav Search
    $fixedNavSearchBtn.on("click", function (e) {
      e.preventDefault();
      $fixedNavWrapper.hide();
      $fixedNavSearchBar.css("display", "flex").hide().fadeIn(200);
      $fixedSearchInput.val($searchInput.val());
      if ($fixedSearchInput.val().length > 0) {
        $fixedClearBtn.show();
      } else {
        $fixedClearBtn.hide();
      }
      setTimeout(function () {
        $fixedSearchInput.focus();
      }, 50);
    });

    $fixedCloseBtn.on("click", function (e) {
      e.preventDefault();
      $fixedNavSearchBar.hide();
      $fixedNavWrapper.css("display", "flex").hide().fadeIn(200);
    });

    // Escape key closes search bar
    $(document).on("keydown", function (e) {
      if (e.key === "Escape" && $fixedNavSearchBar.is(":visible")) {
        $fixedCloseBtn.trigger("click");
      }
    });

    // Fixed Search input events
    $fixedSearchInput.on("input keyup paste", function () {
      var val = $fixedSearchInput.val();
      $searchInput.val(val);
      filterMenu();
    });

    $fixedClearBtn.on("click", function () {
      $fixedSearchInput.val("").focus();
      $searchInput.val("");
      filterMenu();
    });

    // Main page search input events
    $searchInput.on("input keyup paste", function () {
      var val = $searchInput.val();
      $fixedSearchInput.val(val);
      filterMenu();
    });

    $clearBtn.on("click", function () {
      $searchInput.val("").focus();
      $fixedSearchInput.val("");
      filterMenu();
    });

    $filterChips.on("click", function () {
      $filterChips.removeClass("active");
      $(this).addClass("active");
      activeFilter = $(this).data("filter");
      filterMenu();
    });

    $resetBtn.on("click", function () {
      $searchInput.val("");
      $fixedSearchInput.val("");
      $filterChips.removeClass("active");
      $('.filter-chip[data-filter="all"]').addClass("active");
      activeFilter = "all";
      filterMenu();
    });
  });

  $post.each(function () {
    var postText = $(this).html();
    var fa = [];
    for (var i = 0; i < icons.length; i++) {
      fa[i] = {};
      fa[i].str = "@" + icons[i] + "@";
      fa[i].icon = icons[i];
      fa[i].int = postText.search(fa[i].str);

      if (fa[i].int > -1) {
        fa[i].count = postText.match(new RegExp(fa[i].str, "g")).length;
        for (var j = 0; j < fa[i].count; j++) {
          $(this).html(
            $(this)
              .html()
              .replace(fa[i].str, "<i class='fa " + fa[i].icon + "'></i>")
          );
        }
      }
    }
  });

  // Register Service Worker for PWA
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function () {});
    });
  }
})(jQuery);
