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

import org.apache.commons.lang.StringUtils;

import de.micromata.genome.gwiki.page.impl.actionbean.ActionBeanBase;
import de.micromata.genome.gwiki.plugin.GWikiPluginRepository;

/**
 * @author Roger Rene Kommer (r.kommer@micromata.de)
 * 
 */
public class GWikiPluginsAdminActionBean extends ActionBeanBase
{
  protected String pluginName;

  protected GWikiPluginRepository pluginRepo;

  protected void initPlugins()
  {
    pluginRepo = wikiContext.getWikiWeb().getDaoContext().getPluginRepository();
  }

  public Object onInit()
  {
    initPlugins();
    return null;
  }

  public Object onActivate()
  {
    initPlugins();

    if (StringUtils.isBlank(pluginName) == true) {
      wikiContext.addSimpleValidationError("No plugin name is given");
      return null;
    }
    wikiContext.getWikiWeb().getDaoContext().getPluginRepository().activePlugin(wikiContext, pluginName);
    return null;
  }

  public Object onDeactivate()
  {
    initPlugins();

    if (StringUtils.isBlank(pluginName) == true) {
      wikiContext.addSimpleValidationError("No plugin name is given");
      return null;
    }
    wikiContext.getWikiWeb().getDaoContext().getPluginRepository().deactivatePlugin(wikiContext, pluginName);
    return null;
  }

  public GWikiPluginRepository getPluginRepo()
  {
    return pluginRepo;
  }

  public void setPluginRepo(GWikiPluginRepository pluginRepo)
  {
    this.pluginRepo = pluginRepo;
  }

  public String getPluginName()
  {
    return pluginName;
  }

  public void setPluginName(String pluginName)
  {
    this.pluginName = pluginName;
  }
}