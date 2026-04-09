import "/assets/2/kendo-2025.4.1111/mjs/kendo.autocomplete.js";
import "/assets/2/kendo-2025.4.1111/mjs/kendo.button.js";
import "/assets/2/kendo-2025.4.1111/mjs/kendo.dropdownlist.js";
import "/assets/2/kendo-2025.4.1111/mjs/kendo.menu.js";
import "/assets/2/kendo-2025.4.1111/mjs/kendo.notification.js";
import "/assets/2/kendo-2025.4.1111/mjs/kendo.textarea.js";
import "/assets/2/kendo-2025.4.1111/mjs/kendo.textbox.js";
import "/assets/2/kendo-2025.4.1111/mjs/kendo.tooltip.js";
import "/assets/2/kendo-2025.4.1111/mjs/kendo.window.js";
import "/assets/2/kendo-2025.4.1111/t.js";

kendo.ui.Menu.fn.options.animation.open.duration = 0;
kendo.ui.Menu.fn.options.animation.close.duration = 0;
kendo.ui.Popup.fn.options.animation.open.duration = 0;
kendo.ui.Popup.fn.options.animation.close.duration = 0;

$("header ul.navigation").kendoMenu({
  hoverDelay: 0,
  scrollable: false
});
