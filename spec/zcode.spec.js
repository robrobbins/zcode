describe('zcode', function() {
  it('splits the input string into the parent-child array', function() {
    expect(zcode.getParentChild('div>p')).toEqual(['div', 'p']);
  });

  it('recognizes a flat hierarchy', function() {
    zen('div.foo+p');
    expect(zcode.data.childless).toBe(true);
  });

  it('expands a single multiplier', function() {
    expect(zcode.expandMultipliers(['div', 'ul', 'li*3'])).toEqual(
      ['div', 'ul', 'li+li+li']);
  });

  it('expands multiple multipliers, ignores classes', function() {
    expect(zcode.expandMultipliers(['div.foo*2', 'p*2', 'ul', 'li.bar*2'])).toEqual(
      ['div.foo+div.foo', 'p+p', 'ul', 'li.bar+li.bar']);
  });

  it('expands convoluted multipliers', function() {
    expect(zcode.expandMultipliers(['div.foo*2+span#bar+p.baz*4', 'a'])).toEqual(
      ['div.foo+div.foo+span#bar+p.baz+p.baz+p.baz+p.baz', 'a']);
  });

  it('groups siblings into sub-arrays', function() {
      expect(zcode.groupSiblings(['div', 'ul', 'li+li+li'])).toEqual(
        ['div', 'ul', ['li','li','li']]);
  });

  it('gets an info object for a tag representation with a single id', function() {
      expect(zcode.getInfo('div#foo')).toEqual({tag: 'div', id:'foo'});
  });

  it('gets an info object for a tag representation with a single class', function() {
      expect(zcode.getInfo('input.foo')).toEqual({tag: 'input', classes:['foo']});
  });

  it('gets an info object for a tag representation with a multiple classes', function() {
    expect(zcode.getInfo('textarea.foo.bar.baz')).toEqual({tag: 'textarea', classes:['foo','bar','baz']});
  });

  it('gets an info object for a tag representation with a single id and multiple classes', function() {
    expect(zcode.getInfo('h3#foo.bar.baz')).toEqual({tag: 'h3', id: 'foo', classes:['bar','baz']});
  });

  it('gets an info object for a tag representation with a single attr', function() {
    expect(zcode.getInfo('a[href="foo"]')).toEqual({tag: 'a', attrs: 'href="foo"'});
  });

  it('gets an info object for a tag representation with a multiple attrs', function() {
    expect(zcode.getInfo('a[href="foo" bar]')).toEqual({tag: 'a', attrs: 'href="foo" bar'});
  });

  it('gets an info object for a tag representation with an id + attrs', function() {
    expect(zcode.getInfo('a#foo[href="bar"]')).toEqual({tag: 'a', id: 'foo', attrs: 'href="bar"'});
  });

  it('gets an info object for a tag representation with an id + classes + attrs', function() {
    expect(zcode.getInfo('a#foo.bar[href="baz"]')).toEqual({tag: 'a', id: 'foo', attrs: 'href="baz"', classes: ['bar']});
  });

  it('gets an info object for a tag representation with text content', function() {
    expect(zcode.getInfo('a{foo bar}')).toEqual({tag: 'a', content: 'foo bar'});
  });

  it('gets an info object for a tag representation with an id + content', function() {
    expect(zcode.getInfo('a#foo{bar baz}')).toEqual({tag: 'a', id: 'foo', content: 'bar baz'});
  });

  it('gets an info object for a tag representation with an id + classes + attrs + content', function() {
    expect(zcode.getInfo('a#foo.bar[href="baz"]{qux vap}')).toEqual({tag: 'a', id: 'foo', attrs: 'href="baz"', classes: ['bar'], content: 'qux vap'});
  });

  it('expands an info object into a tag', function() {
    expect(zcode.expandTag({tag: 'div', id: 'foo', classes: ['bar', 'baz']})).toBe('<div id="foo" class="bar baz"></div>');
  });

  it('can take the zen string and return the html string for a single tag', function() {
    expect(zen('div#foo.bar.baz')).toBe('<div id="foo" class="bar baz"></div>');
  });

  it('can take a zen string of nested single tags and return the html string', function() {
    expect(zen('table>tr>th')).toBe('<table><tr><th></th></tr></table>');
  });

  it('can parse a zen string of nested tags with sibling multipliers', function() {
    expect(zen('div.foo>ul#bar>li.baz*3')).toBe('<div class="foo"><ul id="bar"><li class="baz"></li><li class="baz"></li><li class="baz"></li></ul></div>');
  });

  it('can parse non multiplied siblings with different content', function() {
    expect(zen('ul>li.active{me}+li{not me}')).toBe('<ul><li class="active">me</li><li>not me</li></ul>');
  });

  it('can parse data- via attributes', function() {
    expect(zen('div[data-foo="bar"]')).toBe('<div data-foo="bar"></div>');
  });

  it('can handle the El+El>El form', function() {
    expect(zen('div+div>a')).toBe('<div></div><div><a></a></div>');
  });

  it('can handle the El+El>El+El form', function() {
    expect(zen('div+div>p+p')).toBe('<div></div><div><p></p><p></p></div>');
  });
});
