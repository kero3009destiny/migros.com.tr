// all routes will be exported from here.

// authentication
export const ROUTE_LOGIN = 'giris';
export const ROUTE_SIGNUP = 'kayit';
export const ROUTE_FORGOT_PASSWORD = 'sifremi-unuttum';
export const ROUTE_RESET_PASSWORD = 'sifremi-yenile';
export const ROUTE_EMAIL_UNSUBSCRIBE = 'email/unsubscribe';

// checkout
export const ROUTE_DELIVERY_OPTIONS = 'teslimat-yontemi';
export const ROUTE_DELIVERY_ADDRESS_PAGE = 'teslimat-adresi';
export const ROUTE_ORDER_SUCCESS_PAGE = 'siparis/basarili';
export const ROUTE_ADDRESS_SELECTOR = 'adres';
export const ROUTE_ORDER = 'siparis';
export const ROUTE_DELIVERY_TIME = 'teslimat-zamani';
export const ROUTE_DELIVERY_PAYMENT = 'odeme';
export const ROUTE_ELECTRONIC = 'elektronik';
export const ROUTE_SACRIFICE = 'kurban';
export const ROUTE_HEMEN = 'hemen';

// membership
export const ROUTE_MEMBERSHIP = 'uyelik';
export const ROUTE_USER_ADDRESSES = 'adreslerim';
export const ROUTE_USER_ORDERS = 'siparislerim';
export const ROUTE_FAVORITE_PRODUCTS = 'favorilerim';
export const ROUTE_POINTS = 'puanlarim';
export const ROUTE_HEALTHY_LIFE = 'saglikli-yasam';
export const ROUTE_SETTINGS = 'ayarlarim';
export const ROUTE_ORDER_TRACKING = 'siparis-takibi';
export const ROUTE_ORDER_TRACKING_MOBILE_MODAL = 'siparis-takibi-modal';
export const ROUTE_MEMBERSHIP_INFORMATION = 'bilgilerim';
export const ROUTE_MONEY_REGISTER = 'money-kayit';
export const ROUTE_MONEY_GOLD = 'money-gold';

// independent pages
export const ROUTE_ALO_MIGROS = 'alo-migros';
export const ROUTE_BRANDS = 'markalar';
export const ROUTE_DIGITAL_GAME_CODES = 'dijital-oyun-kodlari';
export const ROUTE_DIGITAL_GAME_CODES_TR = 'dijital-oyun-kodları';
export const ROUTE_MONEY_TRANSFER = 'para-transferi';
export const ROUTE_MONEY_TRANSFER_INFO = 'para-transferi-hakkinda-bilgilendirme';
export const ROUTE_SEARCH_MOBILE = 'arama-mobil';

//footer
export const ROUTE_PROCESS_GUIDE = 'islem-rehberi';
export const ROUTE_PERSONAL_DATA = 'kisisel-verilerin-korunmasi';
export const ROUTE_CUSTOMER_SUPPORT = 'musteri-hizmetleri';
export const ROUTE_CONTACT = 'iletisim';
export const ROUTE_SECURITY = 'guvenli-alisveris';
export const ROUTE_ELECTRONIC_ARCHIVE = 'e-arsiv-bilgilendirme';
export const ROUTE_TERMS_OF_USE_AND_PRIVACY = 'kullanim-kosullari-ve-gizlilik';
export const ROUTE_COMPANY_INFO = 'hakkimizda';
export const ROUTE_NEAREST_STORE = 'en-yakin-migros';

// mobile navigation routes
export const ROUTE_HOME = '';
export const ROUTE_CATEGORIES = 'kategoriler';
export const ROUTE_CART = 'sepetim';
export const ROUTE_ACCOUNT = '/hesabim';
export const ROUTE_CAMPAIGNS = 'kampanyalar';
export const ROUTE_CAMPAIGNS_LEGACY = 'kampanyalarim';

// product search pages
// p is for product detail page
// x is for dynamic pages
// ul is for user lists
export const ROUTE_PRODUCT_SEARCH_LIST_PAGE = new RegExp('[0-9a-zA-Z-]+-(?![pPxXuU])[a-zA-Z]{1,2}-[0-9a-zA-Z]+$');
export const ROUTE_PRODUCT_SEARCH_PAGE = 'arama';

export const ROUTE_DYNAMIC_PAGE = new RegExp('[0-9a-zA-Z-]+-x-([0-9a-zA-Z]+)$');

export const ROUTE_PRODUCT_PAGE = new RegExp('[0-9a-zA-Z-]+-p-([0-9a-zA-Z]+)$');

export const ROUTE_ELECTRONIC_REGEX = new RegExp('\\/elektronik$|\\/elektronik\\/');

export const ROUTE_KURBAN_REGEX = new RegExp('\\/kurban$|\\/kurban\\/');

export const ROUTE_HEMEN_REGEX = new RegExp('\\/hemen$|\\/hemen\\/');
