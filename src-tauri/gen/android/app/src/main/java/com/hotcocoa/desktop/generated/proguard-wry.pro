# THIS FILE IS AUTO-GENERATED. DO NOT MODIFY!!

# Copyright 2020-2023 Tauri Programme within The Commons Conservancy
# SPDX-License-Identifier: Apache-2.0
# SPDX-License-Identifier: MIT

-keep class com.hotcocoa.desktop.* {
  native <methods>;
}

-keep class com.hotcocoa.desktop.WryActivity {
  public <init>(...);

  void setWebView(com.hotcocoa.desktop.RustWebView);
  java.lang.Class getAppClass(...);
  java.lang.String getVersion();
}

-keep class com.hotcocoa.desktop.Ipc {
  public <init>(...);

  @android.webkit.JavascriptInterface public <methods>;
}

-keep class com.hotcocoa.desktop.RustWebView {
  public <init>(...);

  void loadUrlMainThread(...);
  void loadHTMLMainThread(...);
  void evalScript(...);
}

-keep class com.hotcocoa.desktop.RustWebChromeClient,com.hotcocoa.desktop.RustWebViewClient {
  public <init>(...);
}
