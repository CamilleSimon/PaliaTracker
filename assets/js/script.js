$(document).ready(function () {
  init();

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
      fishName = $(this).parent().parent().children()[1].innerHTML;
    if ($(this).is(":checked")) {
      saveFish(fishName, isStarFish);
    } else {
      deleteFish(fishName, isStarFish);
    }
    /** Check if row needs to be hidden */
    const valueFilter = $("select#filter option:selected").attr("value");
    console.log("filterValue: " + valueFilter + ", dataType: " + dataType);
    if (valueFilter == dataType) {
      $(this).parent().parent().toggle();
    } else if (valueFilter == "any") {
      const tr = $(this).parent().parent(),
        normalCheckbox = tr.find("[data-type=normal]")[0].checked,
        oneStarCheckbox = tr.find("[data-type=one-star]")[0].checked;
      console.log("normal: " + normalCheckbox + ", star: " + oneStarCheckbox);
      console.log(tr);
      tr.toggle(!(normalCheckbox && oneStarCheckbox));
    }
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
        $(this).children(".name").text().toLowerCase().indexOf(valueName) == 0;
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
function deleteFish(name, isStarFish) {
  let stored = JSON.parse(localStorage.getItem(name));
  if (stored) {
    if (isStarFish) {
      stored[1] = false;
    } else {
      stored[0] = false;
    }
  }
  localStorage.setItem(name, JSON.stringify(stored));
}

/**
 * Restore checkboxes with the stored status
 */
function init() {
  $("table > tbody > tr").each(function () {
    let name = $(this).children()[1].innerHTML,
      stored = JSON.parse(localStorage.getItem(name));
    if (stored) {
      if (stored[0] == true) {
        $(this).children().find("[data-type=normal]")[0].checked = true;
      }
      if (stored[1] == true) {
        $(this).children().find("[data-type=one-star]")[0].checked = true;
      }
    }
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
    dataSort = td.attr("data-bait") || td.attr("data-rarity");
  if (!td.text()) {
    return td.children("input")[0].checked == true ? "0" : "1";
  } else if (dataSort) {
    return dataSort;
  } else {
    return td.text();
  }
}
