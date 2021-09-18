export interface FooterLinkModel {
  externalLink?: string;
  imageUrl?: string;
  link?: string;
  name?: string;
  queryParams?: Record<string, string | number>;
}

export const GENERAL_LINKS = [
  { link: 'islem-rehberi', queryParams: { id: 8 }, name: 'Hakkımızda' },
  /* These links will be used when all pages are moved to pwa
  { link: 'hakkimizda', name: 'Hakkımızda' },
   */
  { link: 'islem-rehberi', queryParams: { id: 1 }, name: 'İşlem Rehberi' },
  { link: 'islem-rehberi', queryParams: { id: 6 }, name: 'Sıkça Sorulan Sorular' },
  { link: 'islem-rehberi', queryParams: { id: 5 }, name: 'Müşteri Hizmetleri' },
  { link: 'islem-rehberi', queryParams: { id: 7 }, name: 'İletişim' },
  { link: 'islem-rehberi', queryParams: { id: 9 }, name: 'Kişisel Verilerin Korunması Hakkında Aydınlatma Metni' },
  { link: 'islem-rehberi', queryParams: { id: 766 }, name: 'Kişisel Verileri Saklama ve İmha Politikası' },
  { link: 'islem-rehberi', queryParams: { id: 767 }, name: 'Kişisel Verilerin Korunması ve İşlenmesi Politikası' },
  { link: 'islem-rehberi', queryParams: { id: 10 }, name: 'Kullanım Koşulları ve Gizlilik' },
  { link: 'islem-rehberi', queryParams: { id: 777 }, name: 'Çerez Aydınlatma Metni' },
  { link: 'islem-rehberi', queryParams: { id: 12 }, name: 'E-Arşiv Bilgilendirme' },
  { link: 'islem-rehberi', queryParams: { id: 11 }, name: 'Güvenli Alışveriş' },

  /* These links will be used when all pages are moved to pwa
  { link: 'musteri-hizmetleri', name: 'Müşteri Hizmetleri' },
  { link: 'iletisim', name: 'İletişim' },
  { link: 'kisisel-verilerin-korunmasi?id=9', name: 'Kişisel Verilerin Korunması Hakkında Aydınlatma Metni' },
  { link: 'kisisel-verilerin-korunmasi?id=766', name: 'Kişisel Verileri Saklama ve İmha Politikası' },
  { link: 'kisisel-verilerin-korunmasi?id=767', name: 'Kişisel Verilerin Korunması ve İşlenmesi Politikası' },
  { link: 'kullanim-kosullari-ve-gizlilik', name: 'Kullanım Koşulları ve Gizlilik' },
  { link: 'e-arsiv-bilgilendirme', name: 'E-Arşiv Bilgilendirme' },
  { link: 'guvenli-alisveris', name: 'Güvenli Alışveriş' },
   */
  { link: 'markalar', name: 'Markalar' },
];

export const CORPORATE_LINKS = [
  { link: 'https://surdurulebilirlik.migroskurumsal.com', name: 'Sürdürülebilirlik' },
  { link: 'https://www.migroskurumsal.com/Icerik.aspx?IcerikID=163', name: 'Kalite Anlayışı' },
  { link: 'https://toptan.migros.com.tr/', name: 'Migros Toptan' },
  { link: 'https://www.migroskurumsal.com/Icerik.aspx?IcerikID=436', name: 'İnsan Kaynakları Politikamız' },
  { link: 'https://www.migroskurumsal.com/IKBasvuru.aspx?IcerikID=36', name: 'İş Başvurusu' },
  {
    link: 'https://www.money.com.tr/mc/money-ozelliklerini-kesfet/kurumsal-satis/32',
    name: 'Kurumsal Kart & Çek Satışı',
  },
];

export const POPULAR_LINKS = [
  { link: 'mevsim-sebzeleri-c-3f4', name: 'Mevsim Sebzeleri' },
  { link: 'dondurma-c-41b', name: 'Dondurma' },
  { link: 'dana-eti-c-3fa', name: 'Dana Eti' },
  { link: 'maske-c-2915', name: 'Maske' },
  { link: 'uzun-omurlu-sut-c-40a', name: 'Uzun Ömürlü Süt' },
  { link: 'eldiven-c-2914', name: 'Eldiven' },
  { link: 'egzotik-meyveler-c-3ea', name: 'Egzotik Meyveler' },
  { link: 'el-dezenfektani-c-11861', name: 'El Dezenfektanı' },
  { link: 'yumurta-c-70', name: 'Yumurta' },
  { link: 'sac-bakim-c-8f', name: 'Saç Bakım' },
  { link: 'kagit-havlu-c-49d', name: 'Kağıt Havlu' },
  { link: 'tiras-malzemeleri-c-90', name: 'Tıraş Malzemeleri' },
  { link: 'tuvalet-kagidi-c-49c', name: 'Tuvalet Kağıdı' },
  { link: 'zeytinyagi-c-433', name: 'Zeytinyağı' },
  { link: 'tiras-bicagi-c-4ab', name: 'Tıraş Bıçağı' },
  { link: 'turk-kahvesi-c-28c4', name: 'Türk Kahvesi' },
  { link: 'taze-kasar-c-273b', name: 'Taze Kaşar' },
  { link: 'dis-macunu-c-4a1', name: 'Diş Macunu' },
  { link: 'pilic-c-3fe', name: 'Piliç' },
  { link: 'jel-camasir-suyu-c-28d7', name: 'Jel Çamaşır Suyu' },
  { link: 'aycicek-yagi-c-42d', name: 'Ayçiçek Yağı' },
  { link: 'kuzu-eti-c-3fb', name: 'Kuzu Eti' },
  { link: 'atistirmalik-c-113fb', name: 'Atıştırmalık' },
  { link: 'sampuan-c-4a4', name: 'Şampuan' },
  { link: 'balik-deniz-urunleri-c-6a', name: 'Balık & Deniz Ürünleri' },
  { link: 'demlik-poset-cay-c-1121e', name: 'Demlik Poşet Çay' },
  { link: 'bebek-bezi-c-ab', name: 'Bebek Bezi' },
  { link: 'baldo-pirincler-c-2788', name: 'Baldo Pirinç' },
  { link: 'bebek-mamasi-c-299b', name: 'Bebek Maması' },
  { link: 'devam-sutu-c-1136b', name: 'Devam Sütü' },
  { link: 'dis-fircasi-c-4a0', name: 'Diş Fırçası' },
  { link: 'filtre-kahve-c-11223', name: 'Filtre Kahve' },
  { link: 'dondurulmus-gida-c-7c', name: 'Dondurulmuş Gıda' },
  { link: 'kolonya-c-4cf', name: 'Kolonya' },
  { link: 'telefon-ve-aksesuarlari-c-525', name: 'Telefon Ve Aksesuarları' },
  { link: 'hijyenik-ped-c-96', name: 'Hijyenik Ped' },
  { link: 'kopek-mamasi-c-29dc', name: 'Köpek Maması' },
  { link: 'cicek-bali-c-2769', name: 'Çiçek Balı' },
  { link: 'kirtasiye-c-11420', name: 'Kırtasiye' },
  { link: 'oyuncak-c-9e', name: 'Oyuncak' },
];

export const NEWNESS_LINKS = [
  { link: 'para-transferi', name: 'Para Transferi' },
  { link: 'dijital-oyun-kodlari', name: 'Dijital Oyun Kodları' },
  { link: 'alo-migros', name: 'Alo Migros' },
  {
    externalLink: 'https://www.money.com.tr/mc/money-ozelliklerini-kesfet/saglikli-yasam-yolculugum/123',
    name: 'Sağlıklı Yaşam Yolculuğum',
  },
  { externalLink: 'https://www.money.com.tr', name: 'Money' },
  { externalLink: 'https://migrostv.migros.com.tr', name: 'Migros TV' },
];

export interface MobileAppLink {
  link: string;
  imageUrl: string;
}

export const MOBILE_APP_LINKS: MobileAppLink[] = [
  {
    link: 'https://apps.apple.com/tr/app/migros-sanal-market/id397585390?l=tr',
    imageUrl: 'assets/logos/mobile-app/app-store.svg',
  },
  {
    link: 'https://play.google.com/store/apps/details?id=com.inomera.sm',
    imageUrl: 'assets/logos/mobile-app/google-play.svg',
  },
  {
    link: 'https://appgallery.huawei.com/#/app/C101624469',
    imageUrl: 'assets/logos/mobile-app/app-gallery.svg',
  },
];

export const SOCIAL_LINKS = [
  {
    link: 'https://www.instagram.com/migros_tr',
    imageUrl: 'assets/logos/social/instagram.svg',
  },
  {
    link: 'https://www.facebook.com/MigrosTurkiye',
    imageUrl: 'assets/logos/social/facebook.svg',
  },
  {
    link: 'https://twitter.com/Migros_Turkiye',
    imageUrl: 'assets/logos/social/twitter.svg',
  },
  {
    link: 'https://www.youtube.com/user/TVMigros',
    imageUrl: 'assets/logos/social/youtube.svg',
  },
  {
    link: 'https://www.linkedin.com/company/migros-ticaret',
    imageUrl: 'assets/logos/social/linkedin.svg',
  },
];

export const DIGITAL_LINKS = [
  {
    name: 'Migroskop',
    link: 'https://www.money.com.tr/mc/kampanyalara-bak/migroskop-dijital/83',
    imageUrl: 'assets/icons/digital-magazine/migroskop.jpg',
  },
  {
    name: 'Anne-Bebek',
    link: 'https://www.money.com.tr/mc/kampanyalara-bak/anne-bebek-dijital/92',
    imageUrl: 'assets/icons/digital-magazine/anne-bebek.jpg',
  },
];
