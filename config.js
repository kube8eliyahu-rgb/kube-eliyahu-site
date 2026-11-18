/* ===== הגדרות האתר – קובה אליהו =====
   כאן משנים פרטים בלי לגעת בשאר הקוד.            */
window.SITE = {
  // וואטסאפ לבקשות הצעת מחיר (בפורמט בינלאומי, בלי 0 ובלי מקפים)
  whatsapp: '972509766643',
  email: 'kube8eliyahu@gmail.com',

  // רשימת החנויות:
  // אם מפרסמים גיליון Google Sheets כ-CSV, מדביקים כאן את הקישור והאתר יקרא ממנו.
  // אם ריק – האתר קורא מהקובץ data/stores.csv
  storesCsvUrl: '',

  // סרטונים: מוסיפים שורה לכל סרטון חדש (קובץ בתיקייה assets/video)
  // vertical: true לסרטון לאורך (רילס/סטורי)
  film: { src: 'assets/video/brand-film.mp4', poster: 'assets/video/brand-film.jpg', title: 'קובה אליהו – מבית סבתא אסנת' },
  videos: [
    { src: 'assets/video/reel-1.mp4', poster: 'assets/video/reel-1.jpg', title: 'השולחן של סבתא' },
    { src: 'assets/video/reel-2.mp4', poster: 'assets/video/reel-2.jpg', title: 'פריכה מבחוץ' },
    { src: 'assets/video/reel-3.mp4', poster: 'assets/video/reel-3.jpg', title: 'מרק של שישי' },
    { src: 'assets/video/reel-4.mp4', poster: 'assets/video/reel-4.jpg', title: 'מאחורי הקלעים' }
  ]
};
