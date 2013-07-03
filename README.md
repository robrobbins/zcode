#Zcode
###Micro Library to parse "Zencode" into innerHTML

 See the [zen-coding](https://code.google.com/p/zen-coding/) project if you are 
 not familiar with it. Also the [selectors](https://code.google.com/p/zen-coding/wiki/ZenHTMLSelectorsEn) 
 page is handy. 

##Use

**Zcode** exposes a single method, `zen` to the window object (if available) that 
takes a string of **css style selectors** and returns a string suitable for 
injection into the DOM via innerHTML.

###Hierarchies

    zen('header>nav>ul');

    => '<header><nav><ul></ul></nav></header>'

###Siblings

    zen('p+p');

    => '<p></p><p></p>'

Using the **sibling operator** this way allows you to have different attributes
and content per sibling. See those sections below. When all siblings share those
things however, use the **multiplier**.

###Sibling Multiplier

    zen('li*3');

    => '<li></li><li></li><li></li>'

Combine it with the previous example:

    zen('header>nav>ul>li*2');

    => '<header><nav><ul><li></li><li></li></ul></nav></header>'

###Id's, Classes and Attributes

    zen('div#foo>p.bar*2');

    => '<div id="foo"><p class="bar"></p><p class="bar"></p></div>'

    zen('a[href="foo/bar" rel]');

    => '<a href="foo/bar" rel></a>'

You can use the **attribute** operator for `data-*` as well

    zen('div[data-foo="bar"]');

###Content

Text content can be added via

    zen('li{stuff}+li{more stuff}')

###More to Come...
