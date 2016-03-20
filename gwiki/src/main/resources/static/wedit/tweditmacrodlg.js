function MacroInfo() {
	this.newMacro = true;
	this.macroName = null;
	this.macroHead = null;
	this.macroParams = [];
	this.macroHeadDiv = null;
	this.macroBodyDiv = null;
	this.macroMetaInfo = null;
	// html body of the editor
	this.macroBody = null;
	this.findParamByName = function(name) {
		if (!this.macroParams) {
			return null;
		}
		for (var i = 0; i < this.macroParams.length; ++i) {
			if (this.macroParams[i].name == name) {
				return this.macroParams[i];
			}
		}
		return null;
	}

}

function extractMacroDefinition(ed, el) {
	var divel = el;
	if (divel.nodeName != 'DIV') {
		divel = ed.dom.getParent(divel, "DIV");
	}
	var body = null;
	if (divel.getAttribute('class').indexOf('weditmacrobody') != -1) {
		body = divel;
		divel = divel.parentElement;
	}
	if (divel.getAttribute('class').indexOf('weditmacrohead') == -1) {
		console.warn('no macrohead div found');
		return null;
	}
	var head = divel.getAttribute('data-macrohead');
	var ret = new MacroInfo();

	ret.newMacro = false;
	ret.macroName = divel.getAttribute('data-macroname');
	ret.macroHead = head;
	ret.macroHeadDiv = divel;
	ret.macroBodyDiv = body;
	if (body) {
		ret.macroBody = $(body).html();
	}
	return ret;

}

function wedit_show_editmacro_dialog(ed, el) {

	var macroInfo = extractMacroDefinition(ed, el);
	if (!macroInfo) {
		console.warn("Cannot find macro name from element: " + el);
		return;
	}
	wedit_getMacroInfo(macroInfo.macroName, macroInfo.macroHead, function(result) {
		console.debug("Got macro info: " + JSON.stringify(result));
		var resmacroInfo = result.macroInfo;
		if (resmacroInfo) {
			macroInfo.macroParams = resmacroInfo.macroParams;
			macroInfo.macroMetaInfo = resmacroInfo.macroMetaInfo;
		}
		wedit_open_macro_dialog(ed, macroInfo, macroInfo.macroMetaInfo, wedit_updateMacro);
	});

}

function wedit_render_select_new_macro(ed, dialog, modc, list) {
	modc.html('');
	var scrollable = $("<div style='overflow:auto; height: 300px'>");
	for (var i = 0; i < list.length; ++i) {
		var macroMetaInfo = list[i].macroMetaInfo;
		var p = $("<p>");
		p.attr('data-macroName', macroMetaInfo.macroName);
		p.on('click', function(event) {
			$(dialog).dialog('close');
			wedit_switch_to_macro_edit(ed, event.target, list);
		});
		p.text(macroMetaInfo.macroName);
		if (macroMetaInfo.info) {
			p.append($("<br/>"));
			var sp = $("<span style='font-size: 0.9em>");
			sp.text(macroMetaInfo.info);
			p.append(sp);
		}
		scrollable.append(p);
	}
	modc.append(scrollable);
}
function wedit_show_newmacro_dialog(ed) {
	wedit_getMacroInfos(ed, wedit_show_newmacro_dialog_impl);
}
function wedit_show_newmacro_dialog_impl(ed, list) {
	var dialog;
	var modc = $("#editDialogBox");
	wedit_render_select_new_macro(ed, dialog, modc, list);
	var buttons = {};
	buttons["gwiki.common.cancel".i18n()] = function() {
		$(dialog).dialog('close');
		ed.focus();
	};

	dlghtml = modc.html();
	console.debug("dialog: " + dlghtml);
	var dialog = modc.dialog({
	  width : 500,
	  modal : true,
	  buttons : buttons
	});
}

function wedit_switch_to_macro_edit(ed, el, macroMetaInfoList) {
	var macroName = $(el).attr('data-macroName');
	var macroMetaInfo = null;
	for (var i = 0; i < macroMetaInfoList.length; ++i) {
		if (macroMetaInfoList[i].macroMetaInfo.macroName == macroName) {
			macroMetaInfo = macroMetaInfoList[i].macroMetaInfo;
			break;
		}
	}
	var macroInfo = new MacroInfo();
	macroInfo.macroName = macroMetaInfo.macroName;
	macroInfo.macroMetaInfo = macroMetaInfo;

	wedit_open_macro_dialog(ed, macroInfo, macroMetaInfo, function(ed, macroInfo, macroMetaInfo) {
		gwedit_insert_macro_impl(ed, macroInfo)

	});
}
function wedit_render_macro_info(ed, modc, curMacroInfo, macroMetaInfo) {
	modc.html('');
	var contentdiv = $("<div class='ui-dialog-content ui-widget-content'>");
	var th = $("<p>");
	th.text("Macro " + curMacroInfo.macroName);
	contentdiv.append(th);
	var info = $("<p id='wmd_info'></span>");
	if (macroMetaInfo.info) {
		info.text(macroMetaInfo.info);
	}
	contentdiv.append(info);
	if (macroMetaInfo.macroParams.length > 0) {
		var form = $("<form>");
		var fieldset = $("<fieldset>");
		form.append(fieldset);
		for (var i = 0; i < macroMetaInfo.macroParams.length; ++i) {

			var pmi = macroMetaInfo.macroParams[i];
			var label = $("<label>");
			label.text(pmi.name)
			fieldset.append(label);
			var curParam = curMacroInfo.findParamByName(pmi.name);
			var curval = pmi.defaultValue;
			if (curParam) {
				curval = curParam.value;
			}
			fieldset.append( //
			$("<input>") //
			.attr("class", "text ui-widget-content ui-corner-all") //
			.attr('type', 'text') //
			.attr('style', 'width: 100%') //
			.attr('id', 'wmd_param_' + pmi.name).val(curval)//
			);
			if (pmi.info) {
				fieldset.append($("<br/>"));
				fieldset.append($("<span>").text(pmi.info));
				fieldset.append($("<p>"));

			}
		}
		contentdiv.append(form);
	}
	modc.append(contentdiv);
}
function wedit_open_macro_dialog(ed, curMacroInfo, macroMetaInfo, callback) {
	var modc = $("#editDialogBox");

	wedit_render_macro_info(ed, modc, curMacroInfo, macroMetaInfo);

	var buttons = {};
	buttons["gwiki.common.cancel".i18n()] = function() {
		$(dialog).dialog('close');
		ed.focus();
	};
	buttons["gwiki.common.ok".i18n()] = function() {
		var macroInfo = new MacroInfo();
		macroInfo.macroName = curMacroInfo.macroName;
		macroInfo.macroHeadDiv = curMacroInfo.macroHeadDiv;
		macroInfo.macroBodyDiv = curMacroInfo.macroBodyDiv;
		macroInfo.macroMetaInfo = macroMetaInfo;
		for (var i = 0; i < macroMetaInfo.macroParams.length; ++i) {
			var pmi = macroMetaInfo.macroParams[i];
			var val = $('#wmd_param_' + pmi.name).val();
			if (val && val != '') {
				macroInfo.macroParams[macroInfo.macroParams.length] = {
				  name : pmi.name,
				  value : val
				};
			}
		}
		macroInfo.macroHead = wedit_renderHead(macroInfo);

		$(dialog).dialog('close');
		ed.focus();
		callback(ed, macroInfo, macroMetaInfo);
	};
	var dlghtml = modc.html();
	console.debug("dialog: " + dlghtml);
	var dialog = modc.dialog({
	  width : 500,
	  modal : true,
	  buttons : buttons
	});

}

function wedit_escapemacrohead(k) {
	k = k.replace("\\", "\\\\");
	k = k.replace("|", "\\|");
	k = k.replace("=", "\\=");
	return k;
}

function wedit_macroHasRequiredParams(macroMetaInfo) {
	if (!macroMetaInfo.macroParams || macroMetaInfo.macroParams.length == 0) {
		return false;
	}
	for (var i = 0; i < macroMetaInfo.macroParams.length; ++i) {
		var pi = macroMetaInfo.macroParams[i];
		if (pi.required == true) {
			return true;
		}
	}
	return false;
}

function wedit_renderHead(macroInfo) {

	var h = macroInfo.macroName;
	if (macroInfo.macroParams && macroInfo.macroParams.length) {
		h += ':';
		for (var i = 0; i < macroInfo.macroParams.length; ++i) {
			if (i > 0) {
				h += '|';
			}
			var pm = macroInfo.macroParams[i];
			h += wedit_escapemacrohead(pm.name) + '=' + wedit_escapemacrohead(pm.value);
		}
	}
	return h;
}
function wedit_updateMacro(ed, curMacroInfo, newMacroInfo) {
	var nhead = wedit_renderHead(newMacroInfo);

	var hdiv = $(curMacroInfo.macroHeadDiv);
	hdiv.attr('data-macrohead', nhead);
	hdiv.attr('data-macroname', newMacroInfo.macroName);
	hdiv.find(">").text(nhead);
}

function wedit_getMacroInfos(ed, callback) {
	var url = gwedit_buildUrl("edit/WeditService");

	$.ajax(url, {

	  data : {
		  method_onGetMacroInfos : 'true'
	  },
	  dataType : "text",
	  global : false,
	  success : function(data) {
		  var jdata = eval('(' + data + ')');
		  if (jdata.ret == 0) {
			  callback(ed, jdata.list);
		  } else {
			  console.warn("Error get list: " + jdata.ret + "; " + jdata.message);
		  }

	  },
	  fail : function(jqXHR, textStatus, errorThrown) {
		  console.error("got json error: " + textStatus);
	  }
	});
}
function wedit_getMacroInfo(macroName, macroHead, callback) {
	var url = gwedit_buildUrl("edit/WeditService");
	// "?method_onGetMacroInfo=true&macro="
	// + macroName;

	$.ajax(url, {

	  data : {
	    method_onGetMacroInfo : 'true',
	    macro : macroName,
	    macroHead : macroHead
	  },
	  dataType : "text",
	  global : false,
	  success : function(data) {
		  var jdata = eval('(' + data + ')');
		  if (jdata.ret == 0) {
			  callback(jdata);
		  } else {
			  console.warn("Error get list: " + jdata.ret + "; " + jdata.message);
		  }

	  },
	  fail : function(jqXHR, textStatus, errorThrown) {
		  console.error("got json error: " + textStatus);
	  }
	});
}

/**
 * from autocomplete
 * 
 * @param ed
 * @param item
 */
function gwedit_insert_macro(ed, item) {
	console.debug("insert macro");
	wedit_deleteLeftUntil(ed, "{");
	var macroInfo = new MacroInfo();
	macroInfo.macroMetaInfo = item.macroMetaInfo;
	macroInfo.macroName = item.key;
	macroInfo.macroHead = item.key;

	if (wedit_macroHasRequiredParams(macroInfo.macroMetaInfo) == false) {
		gwedit_insert_macro_impl(ed, macroInfo);
		return;
	}
	wedit_open_macro_dialog()
}

function gwedit_insert_macro_impl(ed, macroInfo) // todo here macroInfo
{
	var withbody = macroInfo.macroMetaInfo.hasBody;
	var evalbody = macroInfo.evalBody;
	var headId = wedit_genid("mhead_");
	var bodyid = wedit_genid("mbody_");

	var html = "<div id='" + headId + "' contenteditable='false' class='mceNonEditable weditmacrohead' data-macrohead='"
	    + macroInfo.macroHead + "' data-macroname='" + macroInfo.macroName + "'>" + macroInfo.macroHead;
	if (withbody) {
		html += "<div id='" + bodyid + "' contenteditable='true' class='mceEditable weditmacrobody";
		if (!evalbody) {
			html += " editmacrobd_pre";
		}
		html += "'>";
		if (evalbody) {
			html += " ";
		} else {
			html += "<pre id='" + bodyid + "'>\n</pre>";
		}

		html += "</div>";
	}
	html += "</div>";
	var node = tedit_insertRaw(ed, html);
	if (withbody) {

		if (node.childNodes.length >= 2) {
			var body = node.childNodes[1];
			// var body = ed.$.find("#" + bodyid);
			if (body.childNodes.length > 0) {
				var tn = body.childNodes[0];
				if (tn.childNodes.length > 0) {
					tn = tn.childNodes[0];
				}
				ed.selection.setCursorLocation(tn, 0);
			}
		}
	}
}

function wedit_hide_contextToollBar(ed) {

	var mcefloatpanel = $('.mce-floatpanel');
	if (mcefloatpanel) {
		mcefloatpanel.hide();
	}

}

function wedit_macro_delete_current(ed, el) {
	var divel = el;
	if (divel.nodeName != 'DIV') {
		divel = ed.dom.getParent(divel, "DIV");
	}
	if (!divel) {
		return;
	}
	var body = null;
	if (divel.getAttribute('class').indexOf('weditmacrobody') != -1) {
		body = divel;
		divel = divel.parentElement;
	}
	if (divel.getAttribute('class').indexOf('weditmacrohead') == -1) {
		console.warn('no macrohead div found');
		return null;
	}
	var pnode = divel.parentNode;
	pnode.removeChild(divel);
	wedit_hide_contextToollBar(ed);
}