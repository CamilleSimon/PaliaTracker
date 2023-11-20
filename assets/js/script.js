let fish_array = {};
let fish_names = ["Ancient Fish", "Energized Piranha", "Cactus Moray", "Striped Dace", "Eyeless Minnow", "Midnight Paddlefish", "Honey Loach", "Beluga Sturgeon", "Mottled Gobi", "Channel Catfish", "Thundering Eel", "Enchanted Pupfish", "Bluefin Tuna", "Umbran Carp", "Freshwater Eel", "Bahari Bream", "Bahari Pike", "Hypnotic Moray", "Scarlet Koi", "Smallmouth Bass", "Mirror Carp", "Gillyfin", "Blue Marlin", "Red-bellied Piranha", "Prism Trout", "Rainbow Trout", "Fathead Minnow", "Platinum Chad", "Stalking Catfish", "Ribbontail Ray", "Kenli's Carp", "Silver Salmon", "Albino Eel", "Giant Kilima Stingray", "Mudminnow", "Radiant Sunfish", "Giant Goldfish", "Cantankerous Koi", "Stonefish", "Cloudfish", "Silvery Minnow", "Crimson Fangtooth", "Crucian Carp", "Largemouth Bass", "Kilima Greyling", "Rosy Bitterling", "Kilima Redfin", "Long Nosed Unicorn Fish", "Cutthroat Trout", "Yellowfin Tuna", "Oily Anchovy", "Golden Salmon", "Kilima Catfish", "Paddlefish", "Yellow Perch", "Fairy Carp", "Mutated Angler", "Duskray", "Blobfish", "Void Ray", "Willow Lamprey", "Sardine", "Swordfin Eel", "Striped Sturgeon", "Dawnray", "Calico Koi", "Stickleback", "Stormray", "Flametongue Ray", "Shimmerfin", "Orange Bluegill", "Barracuda", "Painted Perch", "Bat Ray", "Indigo Lamprey", "Alligator Gar", "Blue Spotted Ray", "Spotted Bullhead", "Chub", "Black Sea Bass", "Bahari Bass"];

$(document).ready(function () {

  /**
   * Check if it's an import link
   */
  const urlParams = new URLSearchParams(window.location.search);
  if(urlParams.get('ref') == "paliatracker.com" && urlParams.get('action') == "fish-import"){
    importModal(urlParams);
  }

  init();

  /**
   * Listen to export button
   */
  $('#export').on("click", function () {
    let normal = starred = 0;
    for (var i = 0; i < localStorage.length; i++) {
      console.log(localStorage.key(i), fish_names.indexOf(localStorage.key(i)));
      if(fish_names.indexOf(localStorage.key(i)) >= 0){
        let data = JSON.parse(localStorage.getItem(localStorage.key(i)));
        if(data){
          if(data[0] == true){
            normal++;
          }
          if(data[1] == true){
            starred++;
          }
        }
      }
    };

    $('.fish-export-normal').html(normal);
    $('.fish-export-starred').html(starred);
    $('#export-btn').attr('href', generateExportLink());
    $('#fishModalExport').modal('show');
  })

  /**
   * Sort column when click on column header
   * */
  $("table thead tr th:not(.no-sort)").on("click", function () {
    let table = $(this).parents("table"),
      rows = $(this)
        .parents("table")
        .find("tbody tr")
        .toArray()
        .sort(TableComparer($(this).index())),
      dir = $(this).hasClass("sort-asc") ? "desc" : "asc";

    if (dir == "desc") {
      rows = rows.reverse();
    }

    for (let i = 0; i < rows.length; i++) {
      table.append(rows[i]);
    }

    table.find("thead tr th").removeClass("sort-asc").removeClass("sort-desc");
    $(this)
      .removeClass("sort-asc")
      .removeClass("sort-desc")
      .addClass("sort-" + dir);
  });

  /**
   * Search in Name column
   */
  $("#search").on("keyup", function () {
    listVisibilityUpdate();
  });

  /**
   * Filter table in function of filters
   */
  $("select")
    .on("change", function () {
      listVisibilityUpdate();
    })
    .trigger("change");

  /**
   * Event on checkbox click
   */
  $("input:checkbox").change(function () {
    /** Save checkbox status */
    const dataType = $(this).attr("data-type"),
      isStarFish = !(dataType == "one-star") ? false : true,
      fishName = $(this)
        .parent()
        .parent()
        .find("[data-bs-toggle='tooltip']")[0].innerHTML
        .trim();
    let otherBox;

    if(isStarFish) {
      otherBox = $(this)
        .parent()
        .parent()
        .find("[data-type='normal']")
        .is(":checked");
    } else {
      otherBox = $(this)
        .parent()
        .parent()
        .find("[data-type='one-star']")
        .is(":checked");
    }

    if ($(this).is(":checked")) {
      saveFish(fishName, isStarFish);
    } else {
      deleteFish(fishName, isStarFish, otherBox);
      ungrayLine($(this).parent().parent());
    }
    
    const tr = $(this).parent().parent(),
        normalCheckbox = tr.find("[data-type=normal]")[0].checked,
        oneStarCheckbox = tr.find("[data-type=one-star]")[0].checked;

    /** Check if row needs to be hidden */
    const valueFilter = $("select#filter option:selected").attr("value");
    if (valueFilter == dataType) {
      $(this).parent().parent().toggle();
    } else if (valueFilter == "any") {
      tr.toggle(!(normalCheckbox && oneStarCheckbox));
    }

    grayLine(tr);
  });
});

/**
 * List update
 */
function listVisibilityUpdate() {
  const valueLocation = $("select#location option:selected").attr("value"),
    valueBait = $("select#bait option:selected").attr("value"),
    valueFilter = $("select#filter option:selected").attr("value"),
    valueRarity = $("select#rarity option:selected").attr("value");
  valueName = $("#search").val().toLowerCase();

  $("table > tbody > tr").each(function () {
    let show = true;
    if (valueName)
      show =
        show &&
        $(this)
          .find("[data-bs-toggle='tooltip']")
          .text()
          .toLowerCase()
          .indexOf(valueName) >= 0;
    if (valueBait)
      show = show && $(this).find("[data-bait=" + valueBait + "]").length > 0;
    if (valueLocation)
      show =
        show &&
        $(this).find("[data-location=" + valueLocation + "]").length > 0;
    if (valueRarity)
      show =
        show && $(this).find("[data-rarity=" + valueRarity + "]").length > 0;
    if (valueFilter) {
      if (valueFilter != "any")
        show =
          show && !$(this).find("[data-type=" + valueFilter + "]")[0].checked;
      else {
        show =
          show &&
          (!$(this).find("[data-type=normal]")[0].checked ||
            !$(this).find("[data-type=one-star]")[0].checked);
      }
    }
    $(this).toggle(show);
  });
}

/**
 * Save checkbox status in LocalStorage when checkbox is checked
 * @param {String} name
 * @param {Boolean} isStarFish
 */
function saveFish(name, isStarFish) {
  let stored = JSON.parse(localStorage.getItem(name));
  if (!stored) {
    stored = [];
    stored.push(!isStarFish, isStarFish);
  } else {
    if (isStarFish) {
      stored[1] = true;
    } else {
      stored[0] = true;
    }
  }
  localStorage.setItem(name, JSON.stringify(stored));
}

/**
 * Save checkbox status in LocalStorage when checkbox is unchecked
 * @param {String} name
 * @param {Boolean} isStarFish
 */
function deleteFish(name, isStarFish, otherBox) {
  let stored = JSON.parse(localStorage.getItem(name));
  if(!stored) {
    stored = [];
    if (isStarFish) {
      stored.push(otherBox, false);
    } else {
      stored.push(false, otherBox);
    }
  } else {
    if (isStarFish) {
      stored[1] = false;
    } else {
      stored[0] = false;
    }
  }
  localStorage.setItem(name, JSON.stringify(stored));
}

/**
 * Page initialization
 */
function init() {
  /**
   * Sanitize LocalStorage
   */
  for (var i = 0; i < localStorage.length; i++) {
    if(localStorage.key(i) != localStorage.key(i).trim()) {
      let data = JSON.parse(localStorage.getItem(localStorage.key(i)));
      localStorage.setItem(localStorage.key(i).trim(), JSON.stringify(data));
      localStorage.removeItem(localStorage.key(i));
    }
  }

  if(localStorage.key("Orqnge Bluegill")){
    let data = JSON.parse(localStorage.getItem(localStorage.key("Orqnge Bluegill")));
    localStorage.setItem("Orange Bluegill", JSON.stringify(data));
    localStorage.removeItem("Orqnge Bluegill");
  }
  if(localStorage.key("Albinos Eel")){
    let data = JSON.parse(localStorage.getItem(localStorage.key("Albinos Eel")));
    localStorage.setItem("Albino Eel",  JSON.stringify(data));
    localStorage.removeItem("Albinos Eel");
  }
  if(localStorage.key("Anciant Fish")){
    let data = JSON.parse(localStorage.getItem(localStorage.key("Anciant Fish")));
    localStorage.setItem("Ancient Fish", JSON.stringify(data));
    localStorage.removeItem("Anciant Fish");
  }

  /**
   * Restore checkboxes with the stored status
   */
  $("table > tbody > tr").each(function () {
    let name = $(this).find("[data-bs-toggle='tooltip']")[0].innerHTML.trim(),
      stored = JSON.parse(localStorage.getItem(name));
    if (stored) {
      if (stored[0] == true) {
        $(this).children().find("[data-type=normal]")[0].checked = true;
      } else {
        $(this).children().find("[data-type=normal]")[0].checked = false;
      }
      if (stored[1] == true) {
        $(this).children().find("[data-type=one-star]")[0].checked = true;
      } else {
        $(this).children().find("[data-type=one-star]")[0].checked = false;
      }
    }
    grayLine($(this));
  });
  /**
   * Hide columns
   */
  //mobile
  if ($(window).width() < 768) {
    hideColumnClass("show-rarity");
    hideColumnClass("bait");
    hideColumnClass("bait-image");
    hideColumnClass("location");
    hideColumnClass("time");

    $("[title-tooltip]").each(function () {
      $(this).attr("title", $(this).attr("title-tooltip"));
    });

    $(document).on("mouseover", ".tooltip", function () {
      var tooltipTrigger = $('a[aria-describedby="' + $(this).attr("id") + '"');
      if (!$(tooltipTrigger).hasClass("active")) {
        $(tooltipTrigger).tooltip("show").addClass("active");
      }
    });
  }

  let tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    ),
    tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Gray line if both checkboxes are checked
 */
function grayLine(tr) {
  normalCheckbox = tr.find("[data-type=normal]")[0].checked,
  oneStarCheckbox = tr.find("[data-type=one-star]")[0].checked;
  if(normalCheckbox && oneStarCheckbox) {
    tr.css('opacity', 0.4);
  }
}

function ungrayLine(tr) {
  tr.css('opacity', 1);
}

/**
 * Hide specific column
 * @param {*} name
 */
function hideColumnClass(name) {
  if (name) {
    $("." + name).toggle();
  }
}

/**
 * Show specific column
 * @param {*} name
 */
function showColumnClass(name) {
  if (name)
    $("." + name).each(function () {
      $(this).show();
    });
}

/**
 *
 * @param {int} index
 * @returns
 */
function TableComparer(index) {
  return function (a, b) {
    let valA = TableCellValue(a, index),
      valB = TableCellValue(b, index),
      result =
        $.isNumeric(valA) && $.isNumeric(valB)
          ? valA - valB
          : valA.toString().localeCompare(valB);
    return result;
  };
}

/**
 * Return comparable element depending of the column
 * @param {*} row
 * @param {*} index
 * @returns
 */
function TableCellValue(row, index) {
  let td = $(row).children("td").eq(index),
    dataSort =
      td.attr("data-bait") || td.attr("data-rarity") || td.attr("data-number");
  if (dataSort) {
    return dataSort;
  } else if (!td.text().trim()) {
    return td.children("input")[0].checked == true ? "0" : "1";
  } else {
    return td.text();
  }
}

/**
 * Export to Palia Tracker
 */
function generateExportLink(){
  let paramsObj = {
    ref: "camillesimon.github.io",
    action: "fish-import",
  };
  for (var i = 0; i < localStorage.length; i++) {
    if(fish_names.indexOf(localStorage.key(i)) >= 0){
      let data = JSON.parse(localStorage.getItem(localStorage.key(i)));
      if(data){
        let name = localStorage.key(i);
        paramsObj[name] = data;
      }
    }
  }
  let query = new URLSearchParams(paramsObj).toString()
  return 'https://www.paliatracker.com/fish-tracker?' + query;
}

/**
 * Display modal
 */

function importModal(urlParams){
  let entries = urlParams.entries();
  let normal = starred = 0;
  for(const entry of entries) {
    if(entry[0] != 'ref' && entry[0] != 'action'){
      values = entry[1].split(',');

      if(values[0] == "true") {
        values[0] = true;
        normal++;
      } else {
        values[0] = false;
      }

      if(values[1] == "true") {
        values[1] = true;
        starred++;
      } else {
        values[1] = false;
      }

      fish_array[entry[0]] = [values[0], values[1]]
    }
  }

  $('.fish-import-normal').html(normal);
  $('.fish-import-starred').html(starred);
  $('#fishModalImport').modal('show');
}

function importProcess(){
  if(fish_array){
    localStorage.clear();
    Object.keys(fish_array).forEach(e => localStorage.setItem(e, JSON.stringify(fish_array[e])));
  }
  window.location.replace("fish.html");
}