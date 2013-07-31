// Native Javascript implementation of the Zencoding paradigm that
// returns strings suitable as innerHtml.
// https://code.google.com/p/zen-coding/
// Selector list here:
// https://code.google.com/p/zen-coding/wiki/ZenHTMLSelectorsEn
window.zcode = {
  // Hey, lets make this easily testable!
  expandMultipliers: function expandMultipliers(arr) {
    var re = /[a-z\.\#\[\]=\'\"]+\*\d+/g,
      expand = function(str) {
        // split into [tag, N]
        var ret = [], arr = str.split('*'), 
          n = parseInt(arr[1], 10);
        // expand [tag][N] times
        for(n; n > 0; n--) {
          ret.push(arr[0]);
        }
        return ret.join('+');
      }, replace = function(match, str) {
        var where = str.indexOf(match), arr = [];
        // splice the string apart to remove the match
        // push in any pieces before, the expanded multiplier, and after
        arr.push(str.slice(0, where), expand(match), str.slice(where + match.length));
        return arr.join('');
      };
    return arr.map(function(item) {
      // each entry in the parentChild array
      var match, curr;
      if(item.indexOf('*') !== -1) {
        match = item.match(re);
        // there may be multiple matches, replace them individually
        for(curr; match.length && (curr = match.shift());) {
          item = replace(curr, item);
        }
      }
      return item;
    });
  },
  // take an info object and make an html string
  // the optional html arg is previous (nested) tag expansions
  expandTag: function expandTag(info, html) {
    var opening = this.sub(this.tdef[0], info), closing = this.tags[info.tag], 
      closingTag = closing === 1 ? this.sub(this.tdef[1], info) : this.tdef[closing],
      afterOpen = closing < 2 ? '>' : '', props = '';
    if('id' in info) props += this.sub(this.props.id, info); 
    if('classes' in info) props += this.sub(this.props.classes, {classes: info.classes.join(' ')});
    if('attrs' in info) props += info.attrs;
    if(!props) opening = opening.trim() + afterOpen;
    else opening += (props.trim() + afterOpen);
    return opening + (html || info.content || '') + closingTag;
  },
  getHtml: function getHtml(str) {
    // every getHtml request will 'reset' the data hash
    this.data = {};
    var parentChild = this.getParentChild(str), html;
    // a single element or a top-level series of siblings
    if(parentChild.length < 2) this.data.childless = true;
    parentChild = this.expandMultipliers(parentChild);
    parentChild = this.groupSiblings(parentChild);
    return this.makeHtml(parentChild);
  },
  // given a single string representation of a tag and its properties
  // return an info object about it
  getInfo: function getInfo(str) {
    var reTag = /^[a-z1-9]+/, reId = /#([a-z_-]+)/, 
      reCl = /\.[a-z_-]+/g, reAttr = /\[\s*(.+)\s*\]/,
      reCon = /\{\s*(.+)\s*\}/, reHtmlCon = /\{\{\s*(.+)\s*\}\}/,
      // if an innerHtml content block is present, dont try to match inside it
      sub = str.indexOf('{{') === -1 ? undefined : str.slice(0, str.indexOf('{{')),
      info = {}, match, curr;
    // get the tag
    info.tag = (sub || str).match(reTag)[0];
    // an id?
    if((match = (sub || str).match(reId))) {
      info.id = match[1];
    }
    // classes?
    if((match = (sub || str).match(reCl))) {
      info.classes = [];
      // there may be multiple matches
      for(curr; match.length && (curr = match.shift());) {
        // not using capture (/g) so strip the '.' off
        info.classes.push(curr.replace('.', ''));
      }
    }
    // attrs can be simply pulled out of the brackets
    if((match = (sub || str).match(reAttr))) {
      info.attrs = match[1];
    }
    // content as well
    if((match = str.match(reCon))) {
      info.content = match[1];
    }
    // if the content is HTML, zenception!
    if((match = str.match(reHtmlCon))) {
      info.content = this.getHtml(match[1]);
    }
    return info;
  },
  getParentChild: function getParentChild(str) {
    return str.split('>');
  },
  // group tag selectors by siblings into sub-arrays of the parent_child array
  // and expand multipliers into the same
  groupSiblings: function groupSiblings(arr) {
    // now that the multipliers are handled, group the +siblings
    return arr.map(function(item) {
      return item.indexOf('+') === -1 ? item : item.split('+');
    });
  },
  // given the 'grouped' parentChild collection, expand it into 
  // an html string
  makeHtml: function makeHtml(arr) {
    // iterate the collection backwards by popping items off
    var curr, html = '', shtml = '', info, sub;
    for(curr; arr.length && (curr = arr.pop());) {
      // is this an array of siblings?
      if (Array.isArray(curr)) {
        // they dont wrap
        for(sub; curr.length && (sub = curr.shift());) {
          // if we are at the last element, and there is html -- nest it
          if(!curr.length && html) {
            shtml += this.expandTag(this.getInfo(sub), html);
          } else shtml += this.expandTag(this.getInfo(sub));
        }
        html = shtml;
        // clear the 'sub-html' in case of another sibling array
        shtml = '';
      } else {
        // just a tag, get an info object and 
        // assemble this piece of the html string, wrap it when appropriate
        html = this.expandTag(this.getInfo(curr), html);
      }
    }
    return html;
  },
  props: {
    classes: 'class="${classes}" ',
    id: 'id="${id}" '
  },
  sub: function sub(tpl, data) {
    var fn = function(obj) {
      return tpl.replace(/\$\{(.+?)\}/g,
        function(match, key) {
          return obj[key];
        });
    };
    return fn(data);
  },
  tags: {
    'a':1,'article':1,'aside':1,'b':1,'blockquote':1,'body':1,'br':2,
    'button':1,'canvas':1,'code':1,'datalist':1,'dd':1,'div':1,'dl':1,'dt':1,
    'em':1,'embed':3,'fieldset': 1,'figcaption':1,'figure':1,'footer':1,'form':1,'h1':1,
    'h2':1,'h3':1,'h4':1,'h5':1,'h6':1,'head':1,'header':1,'hgroup':1,'hr':2,
    'html':1,'i':1,'iframe':1,'img':1,'input':2,'kbd':1,'label':1,'legend':1,
    'li':1,'link':3,'mark':1,'menu':1,'meta':1,'nav':1,'noscript':1,'object':1,
    'ol':1,'optgroup':1,'option':1,'p':1,'param':3,'pre':1,'samp':1,'script':1,
    'section':1,'select':1,'select':1,'small':1,'source':3,'span':1,'strong':1,
    'style':1,'sub':1,'sup':1,'table':1,'tbody':1,'td':1,'textarea':1,'tfoot':1,
    'th': 1,'thead':1,'title':1,'tr':1,'ul':1,'var':1,'video':1,'wbr':3
  },
  // 0 -> tag open
  // 1 -> closing tag form
  // 2 -> self closing tag form
  // 3 -> non-closing tag form
  tdef: ['<${tag} ', '</${tag}>', '/>', '>']
};
// alias window.zen to window.zcode.getHtml if its available
if(!window.zen) window.zen = window.zcode.getHtml.bind(window.zcode);
