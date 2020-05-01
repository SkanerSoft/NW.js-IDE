ace.define("ace/theme/nwjside",[], function(require, exports, module) {

exports.isDark = true;
exports.cssClass = "ace-nwjside";
exports.cssText = ".ace-nwjside .ace_gutter {\
background: #2C2931;\
color: #8F908A\
}\
.ace-nwjside .ace_print-margin {\
width: 1px;\
background: #555651\
}\
.ace-nwjside {\
background-color: #17111E;\
color: #AA9CB3\
}\
.ace-nwjside .ace_cursor {\
color: #AA9CB3\
}\
.ace-nwjside .ace_marker-layer .ace_selection {\
background: #312341\
}\
.ace-nwjside.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px #272822;\
}\
.ace-nwjside .ace_marker-layer .ace_step {\
background: rgb(102, 82, 0)\
}\
.ace-nwjside .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid #87824B\
}\
.ace-nwjside .ace_marker-layer .ace_active-line {\
background: #242027\
}\
.ace-nwjside .ace_gutter-active-line {\
background-color: #352B3C\
}\
.ace-nwjside .ace_marker-layer .ace_selected-word {\
border: 1px solid #49483E\
}\
.ace-nwjside .ace_invisible {\
color: #52524d\
}\
.ace-nwjside .ace_entity.ace_name.ace_tag,\
.ace-nwjside .ace_keyword,\
.ace-nwjside .ace_meta.ace_tag,\
.ace-nwjside .ace_storage {\
color: #D86254;\
font-weight: bolder;\
}\
.ace-nwjside .ace_punctuation,\
.ace-nwjside .ace_punctuation.ace_tag {\
color: #D6D6D6\
}\
\
.ace-nwjside .ace_identifier{\
color: #9EB8DD;\
font-weight: bolder;\
}\
\
.ace-nwjside .ace_constant.ace_character,\
.ace-nwjside .ace_constant.ace_language,\
.ace-nwjside .ace_constant.ace_numeric,\
.ace-nwjside .ace_constant.ace_other {\
color: #7987A9;\
font-weight: bolder;\
}\
.ace-nwjside .ace_invalid {\
color: #F8F8F0;\
background-color: #B95448\
}\
.ace-nwjside .ace_invalid.ace_deprecated {\
color: #F8F8F0;\
background-color: #955143\
}\
.ace-nwjside .ace_support.ace_constant,\
.ace-nwjside .ace_support.ace_function {\
color: #7CA5AD;\
font-weight: bold;\
}\
.ace-nwjside .ace_fold {\
background-color: #B5C693;\
border-color: #F8F8F2\
}\
.ace-nwjside .ace_storage.ace_type,\
.ace-nwjside .ace_support.ace_class,\
.ace-nwjside .ace_support.ace_type {\
color: #81B687;\
font-weight: bolder;\
}\
.ace-nwjside .ace_entity.ace_name.ace_function,\
.ace-nwjside .ace_entity.ace_other,\
.ace-nwjside .ace_entity.ace_other.ace_attribute-name,\
.ace-nwjside .ace_variable {\
color: #C49B5A;\
font-weight: bolder;\
}\
.ace-nwjside .ace_variable.ace_parameter {\
color: #D8A66B;\
font-weight: bolder;\
}\
.ace-nwjside .ace_string {\
color: #E6DB74;\
font-weight: bolder;\
}\
.ace-nwjside .ace_comment {\
color: #706C5A\
}\
.ace_autocomplete .ace_text-layer {\
background: #381F39;\
color: #CD96C7;\
}\
.ace_autocomplete .ace_active-line {\
background: #513A47;\
color: #E7B7E2;\
}\
.ace_autocomplete .ace_selected {\
color: #DAB7CC;\
border: 1px solid #A477A2;\
}\
.ace_editor.ace_autocomplete {\
border: 1px solid #5D4168;\
}\
.ace_autocomplete .ace_completion-highlight {\
color: #FFFFFF !important;\
}\
.ace_rightAlignedText {\
color: #AEAEAE;\
}\
.ace-nwjside .ace_indent-guide {\
background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWPQ0FD0ZXBzd/wPAAjVAoxeSgNeAAAAAElFTkSuQmCC) right repeat-y\
}";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
                (function() {
                    ace.require(["ace/theme/nwjside"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
