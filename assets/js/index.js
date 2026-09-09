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

        $post.each(function () {
          if (($(window).height() + w) > ($(document).height() - $(".site-footer").height())) {
            var l = $postholder.length;
            $(".fn-item").removeClass("active");
            var lastNav = $(".fn-item[item_index='" + (l) + "']");
            lastNav.addClass("active");
            if (lastNav[0] && typeof lastNav[0].scrollIntoView === "function") {
              lastNav[0].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
            }
          } else {
            var f = $(this).offset().top - 80;
            var b = $(this).offset().top + $(this).height() - 80;
            var t = $(this).parent(".post-holder").index();
            var i = $(".fn-item[item_index='" + t + "']");
            var a = $(this)
              .parent(".post-holder")
              .prev(".post-holder")
              .find(".post-after");

            $(this).attr("item_index", t);

            if (w >= f && w <= b) {
              if (!i.hasClass("active")) {
                i.addClass("active");
                if (i[0] && typeof i[0].scrollIntoView === "function") {
                  i[0].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                }
              }
              a.fadeOut("slow");
            } else {
              i.removeClass("active");
              a.fadeIn("slow");
            }
          }
        });
      });

      $(".fn-item").on("click", function () {
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
})(jQuery);
