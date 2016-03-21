package de.micromata.genome.gwiki.page.impl.wiki;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * 
 * @author Roger Rene Kommer (r.kommer.extern@micromata.de)
 *
 */
@Retention(RetentionPolicy.RUNTIME)
public @interface MacroInfo {
  String info() default "";

  /**
   * user must not edit this macro.
   * 
   * @return
   */
  boolean restricted() default false;

  MacroInfoParam[] params() default {};

  GWikiMacroRenderFlags[] renderFlags() default {};
}