// @dynamic
export class Browser {
  static enableWorker = true;
  static enableWasm = true;
  static mobileDevice?: boolean;
  static userAgent = navigator?.userAgent;

  static isOpera(): boolean {
    return (
      (!!(<any>window).opr && !!(<any>window).opr.addons) ||
      !!(<any>window).opera ||
      Browser.userAgent?.indexOf(' OPR/') >= 0
    );
  }

  static isFireFox(): boolean {
    const userAgent = Browser.getUserAgent();
    return (
      typeof (<any>window).InstallTrigger !== 'undefined' || /Firefox/i.test(userAgent) || /FxiOS/i.test(userAgent)
    );
  }

  static isSafari(): boolean {
    if (Browser.isChrome() || Browser.isFireFox() || Browser.isEdge()) {
      return false;
    }

    const userAgent = Browser.userAgent;
    return (
      /Safari/i.test(userAgent) || Browser.checkSafari(window['safari'] ? (<any>window).safari.pushNotification : '')
    );
  }

  static isSafari11(): boolean {
    return Browser.isSafari() && Browser.getVersion() === '11';
  }

  private static checkSafari(pushNotification) {
    return pushNotification.toString() === '[object SafariRemoteNotification]';
  }

  static isInternetExplorer(): boolean {
    return /*@cc_on!@*/ false || !!(<any>window).document.documentMode;
  }

  static isEdge(): boolean {
    const userAgent = Browser.getUserAgent();
    return (
      (!Browser.isInternetExplorer() && !!(<any>window).StyleMedia) ||
      /Edge/i.test(userAgent) ||
      /EdgiOS/i.test(userAgent) ||
      /EdgA/i.test(userAgent)
    );
  }

  static isChrome(): boolean {
    const winNav = (<any>window).navigator;
    return (
      (!!(<any>window).chrome && winNav.vendor === 'Google Inc.' && !Browser.isOpera() && !Browser.isEdge()) ||
      (Browser.isIos() && Browser.userAgent?.indexOf('CriOS') !== -1)
    );
  }

  static isBlink(): boolean {
    return (Browser.isChrome() || Browser.isOpera()) && !!(<any>window).CSS;
  }

  static isIosMobileWebView(): boolean {
    const isStandalone = (<any>window)?.navigator?.standalone ?? false;
    return Browser.isIos() && !isStandalone && !Browser.isSafari() && !Browser.isChrome();
  }

  static isAndroidMobileWebView(): boolean {
    return Browser.isAndroid() && !!(<any>window).Android;
  }

  static isIos(): boolean {
    const userAgent = Browser.userAgent;
    return /iPhone/i.test(userAgent) || /iPad/i.test(userAgent) || /iPod/i.test(userAgent);
  }

  static isChromeOs(): boolean {
    const userAgent = Browser.userAgent;
    return /CrOS/i.test(userAgent);
  }

  static isMobile(): boolean {
    if (typeof Browser.mobileDevice !== 'undefined') {
      return Browser.mobileDevice;
    }

    const userAgent = Browser.userAgent;

    Browser.mobileDevice =
      /Android/i.test(userAgent) ||
      /webOS/i.test(userAgent) ||
      /iPhone/i.test(userAgent) ||
      /iPad/i.test(userAgent) ||
      /iPod/i.test(userAgent) ||
      /BlackBerry/i.test(userAgent) ||
      /Windows Phone/i.test(userAgent) ||
      Browser.isIpad();

    return Browser.mobileDevice;
  }

  static getDevice(): string {
    const userAgent = Browser.userAgent;
    return /Android/i.test(userAgent)
      ? 'Android'
      : /webOS/i.test(userAgent)
      ? 'webOS'
      : /iPhone/i.test(userAgent)
      ? 'iPhone'
      : /iPad/i.test(userAgent)
      ? 'iPad'
      : /iPod/i.test(userAgent)
      ? 'iPod'
      : /BlackBerry/i.test(userAgent)
      ? 'BlackBerry'
      : /Windows Phone/i.test(userAgent)
      ? 'Windows Phone'
      : 'Desktop';
  }

  static isIpad(): boolean {
    const isIpad = Browser.userAgent?.toLowerCase().indexOf('ipad') !== -1;

    if (!isIpad && Browser.userAgent?.match(/Mac/) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2) {
      return true;
    }

    return isIpad;
  }

  static isIosDesktopView(): boolean {
    const iOSPlatformMatch = !!(navigator.platform && navigator.platform.match(/iPhone|iPod|iPad/));
    return iOSPlatformMatch || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  static getVersion(): string {
    const userAgent = Browser.userAgent;
    let pieces: RegExpMatchArray | null = [];
    if (Browser.isInternetExplorer()) {
      pieces = /\brv[ :]+(\d+)/g.exec(userAgent) || [];
      return pieces ? pieces[1] || '' : '';
    } else if (Browser.isOpera()) {
      pieces = userAgent.match(/opera\/?\s*(\d+)/i);
      return pieces ? pieces[1] || '' : '';
    } else if (Browser.isIos() || Browser.isSafari()) {
      pieces = userAgent.match(/(version|safari(?=\/))\/?\s*(\d+)/i);
    } else if (Browser.isChrome()) {
      pieces = userAgent.match(/(chrome(?=\/))\/?\s*(\d+)/i);
    } else if (Browser.isFireFox()) {
      pieces = userAgent.match(/(firefox(?=\/))\/?\s*(\d+)/i);
    } else if (Browser.isEdge()) {
      pieces = userAgent.match(/(trident|edge(?=\/))\/?\s*(\d+)/i);
    }

    return pieces ? pieces[2] || '' : '';
  }

  static getName(): string {
    if (Browser.isChrome()) {
      return 'Chrome';
    }
    if (Browser.isFireFox()) {
      return 'FireFox';
    }
    if (Browser.isSafari()) {
      return 'Safari';
    }
    if (Browser.isEdge()) {
      return 'Edge';
    }
    if (Browser.isInternetExplorer()) {
      return 'IE';
    }
    if (Browser.isOpera()) {
      return 'Opera';
    }

    return '';
  }

  static isAndroid(): boolean {
    const userAgent = Browser.userAgent;
    return /Android/i.test(userAgent);
  }

  static inIframe(): boolean {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  static appendScript(
    id: string,
    url: string,
    async: boolean = true,
    onloadFn?: (any) => any,
    onerrorFn?: (any) => any
  ): void {
    if (document.getElementById(id)) {
      return;
    }
    const js = document.createElement('script');
    js.id = id;
    js.src = url;
    js.async = async;
    if (onloadFn && typeof onloadFn === 'function') {
      js.onload = onloadFn;
    }
    if (onerrorFn && typeof onerrorFn === 'function') {
      js.onerror = onerrorFn;
    }
    const scriptElement = document.getElementsByTagName('script')[0];
    scriptElement.parentNode.insertBefore(js, scriptElement);
  }

  static appendMeta(name: string, content: string): void {
    const meta = document.createElement('meta');
    meta.setAttribute('name', name);
    meta.setAttribute('content', content);
    const head = Array.from(document.getElementsByName('head')).slice();
    if (!head.length) {
      return;
    }
    head[0].appendChild(meta);
  }

  static appendStyle(id: string, url: string): void {
    if (document.getElementById(id)) {
      return;
    }

    const head = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    link.media = 'all';
    head.appendChild(link);
  }

  static getIosVersion(): string {
    if (!Browser.isMobile() || !Browser.isIos()) {
      return '';
    }

    const userAgent = Browser.userAgent;
    const start = userAgent.indexOf('OS ');
    if (start > -1) {
      return userAgent.substr(start + 3, 3).replace('_', '.');
    }
  }

  static getAndroidVersion(): string {
    if (!Browser.isMobile() || !Browser.isAndroid()) {
      return '';
    }

    const userAgent = Browser.userAgent;
    const match = userAgent.match(/android\s([0-9\.]*)/i);
    return match ? match[1] : undefined;
  }

  static getUserAgent(): string {
    return Browser.userAgent;
  }

  static isAudioWorkconstEnabled(): boolean {
    if (!(<any>window).OfflineAudioContext) {
      return false;
    }
    const context = new OfflineAudioContext(1, 1, 44100);
    return Boolean((<any>context).audioWorkconst && typeof (<any>context).audioWorkconst.addModule === 'function');
  }

  static getOSVersion(): string {
    if (/[\.\_\d]+/.exec(Browser.getUserAgent())) {
      return /[\.\_\d]+/.exec(Browser.getUserAgent())[0];
    }
  }

  static getOSName(): string {
    const platform = navigator.platform;
    return platform.indexOf('Win') !== -1
      ? 'Windows'
      : platform.indexOf('Mac') !== -1
      ? 'MacOS'
      : platform.indexOf('X11') !== -1
      ? 'UNIX'
      : platform.indexOf('iPhone') !== -1
      ? 'iOS'
      : platform.indexOf('Android') !== -1
      ? 'Android'
      : 'Unknown OS';
  }

  static isMac(): boolean {
    return navigator.appVersion.indexOf('Mac') !== -1;
  }

  static isLinux(): boolean {
    return navigator.appVersion.indexOf('Linux') !== -1;
  }

  static isUnix(): boolean {
    return navigator.appVersion.indexOf('X11') !== -1;
  }

  static isWindows(): boolean {
    return navigator.appVersion.indexOf('Win') !== -1;
  }

  static isWorkerEnabled(): boolean {
    if (!Browser.enableWorker) {
      return false;
    }

    return typeof (<any>window).Worker !== 'undefined';
  }

  static setWorkerEnabledFlag(flag: boolean): void {
    Browser.enableWorker = flag;
  }

  static isWebAssemblyEnabled(): boolean {
    if (!Browser.enableWasm) {
      return false;
    }
    const webAssembly = (<any>window).WebAssembly;
    return typeof webAssembly === 'object' && typeof webAssembly.Memory === 'function';
  }

  static setWebAssemblyEnabledFlag(flag: boolean): void {
    Browser.enableWasm = flag;
  }
}
