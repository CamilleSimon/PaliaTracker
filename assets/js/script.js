$(document).on("click", "table thead tr th:not(.no-sort)", function () {
  var table = $(this).parents("table");
  var rows = $(this)
    .parents("table")
    .find("tbody tr")
    .toArray()
    .sort(TableComparer($(this).index()));
  var dir = $(this).hasClass("sort-asc") ? "desc" : "asc";

  if (dir == "desc") {
    rows = rows.reverse();
  }

  for (var i = 0; i < rows.length; i++) {
    table.append(rows[i]);
  }

  table.find("thead tr th").removeClass("sort-asc").removeClass("sort-desc");
  $(this)
    .removeClass("sort-asc")
    .removeClass("sort-desc")
    .addClass("sort-" + dir);
});

function TableComparer(index) {
  return function (a, b) {
    var val_a = TableCellValue(a, index);
    var val_b = TableCellValue(b, index);
    var result =
      $.isNumeric(val_a) && $.isNumeric(val_b)
        ? val_a - val_b
        : val_a.toString().localeCompare(val_b);

    return result;
  };
}

function TableCellValue(row, index) {
  return $(row).children("td").eq(index).text();
}

$(document).ready(function () {
  $("#search").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $("table > tbody > tr").each(function () {
      $(this).toggle(
        $(this).children(".fish-name").text().toLowerCase().indexOf(value) > -1
      );
    });
  });
});

$(document).ready(function () {
  $("select")
    .on("change", function () {
      var valueLocation = $("select#location option:selected").attr("value"),
        valueBait = $("select#bait option:selected").attr("value");

      if (!valueBait && !valueLocation) {
        $("table > tbody > tr").each(function () {
          $(this).toggle(true);
        });
      } else if (valueLocation && !valueBait) {
        $("table > tbody > tr").each(function () {
          $(this).toggle(
            $(this).find("[data-location=" + valueLocation + "]").length > 0
          );
        });
      } else if (!valueLocation && valueBait) {
        $("table > tbody > tr").each(function () {
          $(this).toggle(
            $(this).find("[data-bait=" + valueBait + "]").length > 0
          );
        });
      } else {
        $("table > tbody > tr").each(function () {
          $(this).toggle(
            $(this).find("[data-bait=" + valueBait + "]").length > 0 &&
              $(this).find("[data-location=" + valueLocation + "]").length > 0
          );
        });
      }
    })
    .trigger("change");
});

$(document).ready(function () {
  $("input:checkbox").change(function () {
    var isStarFish = !$(this).attr("data-type") ? false : true,
      fishName = $(this).parent().parent().children()[1].innerHTML;
    if ($(this).is(":checked")) {
      saveFish(fishName, isStarFish);
    } else {
      deleteFish(fishName, isStarFish);
    }
  });
});

function saveFish(name, isStarFish) {
  var stored = JSON.parse(localStorage.getItem(name));
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

function deleteFish(name, isStarFish) {
  var stored = JSON.parse(localStorage.getItem(name));
  if (stored) {
    if (isStarFish) {
      stored[1] = false;
    } else {
      stored[0] = false;
    }
  }
  localStorage.setItem(name, JSON.stringify(stored));
}

$(document).ready(function () {
  $("table > tbody > tr").each(function () {
    var name = $(this).children()[1].innerHTML;
    var stored = JSON.parse(localStorage.getItem(name));
    console.log($(this).children()[5].firstChild.checked);
    if (stored) {
      if (stored[0] == true) {
        $(this).children()[5].firstChild.checked = true;
      }
      if (stored[1] == true) {
        $(this).children()[6].firstChild.checked = true;
      }
    }
  });
});
