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

package de.micromata.genome.gwiki.controls;

import java.util.List;

import org.apache.commons.lang.StringEscapeUtils;
import org.apache.commons.lang.StringUtils;

import de.micromata.genome.gwiki.page.search.QueryResult;
import de.micromata.genome.gwiki.page.search.SearchQuery;
import de.micromata.genome.gwiki.page.search.SearchResult;
import de.micromata.genome.gwiki.utils.WebUtils;
import de.micromata.genome.util.types.Converter;

/**
 * Ajax ActionBean for searching.
 * 
 * @author Roger Rene Kommer (r.kommer@micromata.de)
 * 
 */
public class GWikiSearchBoxActionBean extends GWikiPageListActionBean
{
  private String pageId;

  private String pageType;

  public GWikiSearchBoxActionBean()
  {

  }

  @Override
  public Object onInit()
  {
    return onLinkAutocomplete();
  }

  public void renderSearchOps(String query)
  {
    StringBuilder sb = new StringBuilder();
    String searchUrl = wikiContext.localUrl("/edit/Search") + "?method_onSearch=go&se=" + WebUtils.encodeUrlParam(query);
    sb.append(searchUrl).append("|").append(translate("gwiki.nav.searchbox.localsearch", StringEscapeUtils.escapeHtml(query)) + "\n");
    if (StringUtils.isNotBlank(pageId) == true) {
      searchUrl += "&childs=" + pageId;
      sb.append(searchUrl).append("|").append(translate("gwiki.nav.searchbox.globalsearch", StringEscapeUtils.escapeHtml(query)) + "\n");
    }
    wikiContext.append(sb.toString());
  }

  public Object onLinkAutocomplete()
  {
    String q = StringUtils.trim(wikiContext.getRequestParameter("q"));
    String pageType = wikiContext.getRequestParameter("pageType");
    List<String> tokens = Converter.parseStringTokens(q, " \t", false);
    String queryexpr = "prop:NOINDEX != true and (prop:PAGEID ~ \"" + q + "\" or prop:TITLE ~ \"" + q + "\")";
    if (tokens.size() > 1) {
      StringBuilder sb = new StringBuilder();
      sb.append("prop:NOINDEX != true and (");
      boolean first = true;
      for (String tk : tokens) {
        if (first == false) {
          sb.append(" or ");
        }
        first = false;
        sb.append("(").append("prop:PAGEID ~ \"" + tk + "\" or prop:TITLE ~ \"" + tk + "\")");
      }
      sb.append(")");
      queryexpr = sb.toString();

    }

    if (StringUtils.isNotEmpty(pageType) == true) {
      queryexpr = "prop:TYPE = " + pageType + " and (" + queryexpr + ")";
    }
    renderSearchOps(q);

    SearchQuery query = new SearchQuery(queryexpr, wikiContext.getWikiWeb().getPageInfos());

    query.setMaxCount(1000);
    QueryResult qr = filter(query);
    StringBuilder sb = new StringBuilder();
    // int size = qr.getResults().size();
    for (SearchResult sr : qr.getResults()) {
      if (sr.getElementInfo().isViewable() == false) {
        continue;
      }
      String t = wikiContext.getTranslatedProp(StringEscapeUtils.escapeHtml(sr.getElementInfo().getTitle()))
          + "<br/>("
          + StringEscapeUtils.escapeHtml(sr.getPageId())
          + ")";
      sb.append(wikiContext.localUrl(sr.getPageId())).append("|").append(t).append("\n");
    }
    wikiContext.append(sb.toString());
    wikiContext.flush();
    return noForward();
  }

  public String getPageId()
  {
    return pageId;
  }

  public void setPageId(String pageId)
  {
    this.pageId = pageId;
  }

  public String getPageType()
  {
    return pageType;
  }

  public void setPageType(String pageType)
  {
    this.pageType = pageType;
  }

}
