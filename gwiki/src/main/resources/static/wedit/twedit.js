var wiki_textpattern_patterns = [ {
  start : '_',
  end : '_',
  format : 'italic'
}, {
  start : '*',
  end : '*',
  format : 'bold'
}, {
  start : 'h1. ',
  format : 'h1'
}, {
  start : 'h2. ',
  format : 'h2'
}, {
  start : 'h3. ',
  format : 'h3'
}, {
  start : 'h4. ',
  format : 'h4'
}, {
  start : 'h5. ',
  format : 'h5'
}, {
  start : 'h6. ',
  format : 'h6'
}, {
  start : '# ',
  cmd : 'InsertOrderedList'
}, {
  start : '- ',
  cmd : 'InsertUnorderedList'
} ];

var twedit_editors = {

};

function twedit_create(partName, content) {

	var editId = 'gwikihtmledit' + partName;
	var ed = tinymce
	    .init({
	      homeUrl : gwikiHomeUrl,
	      selector : '#' + editId,
	      height : 500,
	      tweidac_checkac_start : [ '!', '[', '{' ],
	      visualblocks_default_state : false,
	      end_container_on_empty_block : true,
	      cache_suffix : '?' + Date.now(),
	      paste_data_images : true,
	      paste_preprocess : twedit_preprocess,
	      paste_postprocess : twedit_postprocess,
	      textpattern_patterns : wiki_textpattern_patterns,
	      language : "locale".i18n(),
	      setup : function(ed) {
		      twedit_editors[editId] = ed;
		      ed.on('change', function(e) {
			      // console.log('the event object ' + e);
			      // console.log('the editor object ' + ed);
			      // console.log('the content ' + ed.getContent());
		      });
		      ed.on('paste', function(e) {
			      twedit_paste(this, e);
		      });
		      ed.on('keydown', function(event) {
			      if (event.which == 83 && event.ctrlKey == true) {
				      onSaveOptRedit(event, false);
				      event.stopPropagation();
				      event.preventDefault();
			      }
		      });
		      twedit_bind_native_paste(ed, '#gwikihtmledit' + partName);
	      },

	      theme : 'modern',
	      forced_root_block: false, // br instead of p
	      keep_styles: false, // otherwise h1. will not terminated.
	      /*
				 * plugins : [ 'advlist autolink lists link image charmap print preview
				 * hr anchor pagebreak', 'searchreplace wordcount visualblocks
				 * visualchars code fullscreen', 'insertdatetime media nonbreaking save
				 * table contextmenu directionality', 'template paste textcolor
				 * colorpicker textpattern imagetools' ],
				 */
	      plugins : 'gwiki visualblocks tweditac noneditable paste textpattern fullscreen searchreplace contextmenu  table textcolor colorpicker', //
	      paste_data_images : true,
	      // menubar : "cut copy paste | undo redo | styleselect | bold italic |
				// bullist
	      // numlist",
	      toolbar : "wikisaveaction wikicancelaction fullscreen | cut copy paste| undo redo | searchreplace | wikiimage  wikinewmacro | styleselect bold italic | bullist numlist | table forecolor backcolor",
	      table_toolbar : "tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol",
	      // toolbar1 : 'insertfile undo redo | styleselect | bold italic |
	      // alignleft
	      // aligncenter alignright alignjustify | bullist numlist outdent indent
	      // |
	      // link image',
	      // toolbar2 : 'print preview media | forecolor backcolor emoticons',
	      // image_advtab : true,
	      /*
				 * templates : [ { title : 'Test template 1', content : 'Test 1' }, {
				 * title : 'Test template 2', content : 'Test 2' } ],
				 */
	      image_advtab : true,
	      content_css : gwikiContentCssArray
	    /* ,'//www.tinymce.com/css/codepen.min.css' */
	    });
	return editId;
}

function twedit_setContent(partName, html)
{
	var editId = 'gwikihtmledit' + partName;
	tinymce.get(editId).setContent(html);
}


function tedit_insertRaw(ed, html) {
	var range = ed.selection.getRng(true);
	var node = $(html)[0];
	// var node = tinymce.DOM.createFragment(html);
	range.insertNode(node);

	ed.selection.setCursorLocation(node.nextSibling, 0);
	return node;
}
function gwedit_getCharBeforePos(ed) {
	var rng = ed.selection.getRng(true);
	var txt = rng.startContainer.textContent;
	if (rng.startOffset == 0) {
		return null;
	}
	var rchar = txt.substring(rng.startOffset - 1, rng.startOffset);
	return rchar;
}

function wedit_deleteLeftUntil(ed, char) {
	var range = ed.selection.getRng(true);
	var txt = range.startContainer.textContent;
	var found = false;
	var i;
	for (i = range.startOffset; i >= 0; --i) {
		if (txt.charAt(i) == char) {
			found = true;
		}
	}
	var ntext = txt.substring(0, i) + txt.substring(range.startOffset);
	range.startContainer.textContent = ntext;
}


function wedit_cleanuphtml(content) {
	
	//will not work on text like: h1. bla<br/>blub.
	// jquery-1.12.1.js:1502 Uncaught Error: Syntax error, unrecognized expression: h1. Titel<br />asdf
//	var cnode = $(content); 
//	var attr = cnode.attr("class");
//	if (attr && attr.indexOf("gwikiContent") != -1) {
//		content = cnode.html();
//	}
//	} 
	return content;
}
function gwedit_buildUrl(pageId) {
	// return gwikiContextPath + gwikiServletPath + pageId;
	return gwikiHomeUrl + pageId;
}

function wedit_getCursorCoords(range) {
	var x = 0, y = 0;

	var startc = range.startContainer;
	// a trick to get coordinates.
	var span = document.createElement("span");
	span.appendChild(document.createTextNode("\u200b") /*
																											 * Zero-width space
																											 * character
																											 */);
	range.insertNode(span);

	var rect = span.getBoundingClientRect();
	span.parentNode.removeChild(span);

	y = rect.top;
	x = rect.left;
	return {
	  x : x,
	  y : y
	};
}

// Prevent jQuery UI dialog from blocking focusin
$(document).on('focusin', function(e) {
	if ($(e.target).closest(".mce-window, .moxman-window").length) {
		e.stopImmediatePropagation();
	}
});