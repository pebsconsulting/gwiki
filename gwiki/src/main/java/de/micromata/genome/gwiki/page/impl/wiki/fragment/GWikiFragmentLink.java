////////////////////////////////////////////////////////////////////////////
//
// Copyright (C) 2010 Micromata GmbH
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////

package de.micromata.genome.gwiki.page.impl.wiki.fragment;

import java.util.List;

import org.apache.commons.lang.StringEscapeUtils;
import org.apache.commons.lang.StringUtils;

import de.micromata.genome.gwiki.model.GWikiElementInfo;
import de.micromata.genome.gwiki.page.GWikiContext;
import de.micromata.genome.gwiki.page.RenderModes;
import de.micromata.genome.gwiki.page.search.NormalizeUtils;
import de.micromata.genome.gwiki.utils.WebUtils;
import de.micromata.genome.util.types.Converter;

public class GWikiFragmentLink extends GWikiFragmentChildsBase
{

  private static final long serialVersionUID = 7539226429764305415L;

  private String originTarget;

  private String target;

  private String title;

  private String tip;

  private boolean titleDefined = false;

  private String linkClass = null;

  public GWikiFragmentLink(String target)
  {
    this.originTarget = target;
    List<String> elems = Converter.parseStringTokens(target, "|", false);
    if (elems.size() == 0) {
      target = "";
    } else if (elems.size() == 1) {
      if (isGlobalUrl(target) == false) {
        this.target = normalizeToTarget(target);
      } else {
        this.target = target;
      }
      this.title = target;
    } else if (elems.size() == 2) {
      this.target = elems.get(1);
      this.title = elems.get(0);
      titleDefined = true;
    } else {
      this.target = elems.get(1);
      this.title = elems.get(0);
      this.tip = elems.get(2);
      titleDefined = true;
    }

  }

  protected String normalizeToTarget(String title)
  {
    String id = StringUtils.replace(StringUtils.replace(StringUtils.replace(title, "\t", "_"), " ", "_"), "\\", "/");
    id = NormalizeUtils.normalizeToTarget(id);
    return id;
  }

  public boolean isTitleDefined()
  {
    return titleDefined;
  }

  public void getSource(StringBuilder sb)
  {
    sb.append("[");
    if (titleDefined == true) {
      sb.append(title).append("|");
    }
    sb.append(target);
    sb.append("]");
  }

  public static boolean isGlobalUrl(String url)
  {
    return url.contains(":") == true;
  }

  public void renderTitle(GWikiContext ctx, String ttitel)
  {
    if (titleDefined == true || getChilds().size() == 0) {
      ctx.append(ttitel);
    } else {
      this.renderChilds(ctx);
    }

  }

  public boolean render(GWikiContext ctx)
  {

    if (RenderModes.NoLinks.isSet(ctx.getRenderMode()) == true) {
      if (StringUtils.isNotBlank(title) == true) {
        ctx.append(StringEscapeUtils.escapeHtml(title));
      } else if (isGlobalUrl(target) == true) {
        ctx.append(StringEscapeUtils.escapeHtml(target));
      } else {
        String url = target;
        if (url.indexOf('#') != -1) {
          url = url.substring(0, url.indexOf('#'));
          // localAnchor = url.substring(url.indexOf('#'));
        }
        GWikiElementInfo ei = ctx.getWikiWeb().findElementInfo(url);
        if (ei != null) {
          ctx.append(StringEscapeUtils.escapeHtml(ctx.getTranslatedProp(ei.getTitle())));
        } else {
          ctx.append(StringEscapeUtils.escapeHtml(url));
        }
      }
      return true;
    }
    String url = target;
    String ttitel = title;
    boolean targetExists = false;
    boolean allowToView = true;
    boolean allowToCreate = false;
    String parentUrl = null;
    String localAnchor = null;
    if (ctx.getWikiElement() != null) {
      parentUrl = ctx.getWikiElement().getElementInfo().getId();
    }
    if (isGlobalUrl(url) == false) {
      int li = url.indexOf('#');
      if (li != -1) {
        localAnchor = url.substring(li);
        url = url.substring(0, li);
      }
      GWikiElementInfo ei = null;
      if (StringUtils.isNotEmpty(url) == true) {
        ei = ctx.getWikiWeb().findElementInfo(url);
        if (url.indexOf('/') == -1 && ei == null && ctx.getWikiElement() != null) {
          String pp = GWikiContext.getParentDirPathFromPageId(ctx.getWikiElement().getElementInfo().getId());
          String np = pp + url;
          ei = ctx.getWikiWeb().findElementInfo(np);
          if (ei != null) {
            url = ei.getId();
          }
        }
      }
      if (ei != null && isTitleDefined() == false) {
        ttitel = ctx.getTranslatedProp(ei.getTitle());
      }
      if (StringUtils.isNotEmpty(url) == true) {
        if (ei != null) {
          targetExists = true;
          allowToView = ctx.getWikiWeb().getAuthorization().isAllowToView(ctx, ei);
          url = ctx.localUrl(url);
        } else {
          allowToCreate = ctx.getWikiWeb().getAuthorization().isAllowToCreate(ctx, ctx.getWikiElement().getElementInfo());
        }
      } else {
        targetExists = true;
        allowToView = true;
      }
    } else {
      targetExists = true;
    }
    if (targetExists == false && RenderModes.ForRichTextEdit.isSet(ctx.getRenderMode()) == true) {
      targetExists = true;
    }
    if (targetExists == false) {
      if (allowToCreate == true) {
        ctx.append("<a href='")//
            .append(ctx.localUrl("edit/EditPage?newPage=true&parentPageId="))//
            .append(WebUtils.encodeUrlParam(parentUrl))//
            .append("&pageId=") //
            .append(WebUtils.encodeUrlParam(url))//
            .append("&title=")//
            .append(WebUtils.encodeUrlParam(ttitel))//
            .append("'");
        if (StringUtils.isNotEmpty(tip) == true) {
          ctx.append(" title='", StringEscapeUtils.escapeHtml(tip), "'");
        }
        ctx.append(">");
        renderTitle(ctx, ttitel);
        ctx.append("</a>");
      } else {
        renderTitle(ctx, ttitel);
      }
    } else { // exists
      if (allowToView == false) {
        renderTitle(ctx, ttitel);
      } else {
        String turl = url;
        if (localAnchor != null) {
          turl = turl + localAnchor;
        }
        ctx.append("<a href=\"", turl, "\"");
        if (StringUtils.isNotEmpty(tip) == true) {
          ctx.append(" title='", StringEscapeUtils.escapeHtml(tip), "'");
        } else {
          ctx.append(" title='", StringEscapeUtils.escapeHtml(ttitel), "'");
        }
        if (linkClass != null) {
          ctx.append(" class=\"").append(StringEscapeUtils.escapeXml(linkClass)).append("\"");
        }
        ctx.append(">");
        renderTitle(ctx, ttitel);
        ctx.append("</a>");
      }

    }

    return true;
  }

  public String getTarget()
  {
    return target;
  }

  public void setTarget(String target)
  {
    this.target = target;
  }

  public String getTitle()
  {
    return title;
  }

  public void setTitle(String title)
  {
    this.title = title;
    this.titleDefined = title != null;
  }

  public String getTip()
  {
    return tip;
  }

  public void setTip(String tip)
  {
    this.tip = tip;
  }

  public String getLinkClass()
  {
    return linkClass;
  }

  public void setLinkClass(String linkClass)
  {
    this.linkClass = linkClass;
  }
}