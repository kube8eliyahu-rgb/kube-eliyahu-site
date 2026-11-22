/* ===== הגדרות האתר – קובה אליהו =====
   כאן משנים פרטים בלי לגעת בשאר הקוד.            */
window.SITE = {
  // וואטסאפ לבקשות הצעת מחיר (בפורמט בינלאומי, בלי 0 ובלי מקפים)
  whatsapp: '972509766643',
  email: 'kube8eliyahu@gmail.com',

  // לאן נשלחות הפניות מהטפסים (הצעת מחיר + צור קשר)
  formEmail: 'kube8eliyahu@gmail.com',

  // רשימת החנויות:
  // אם מפרסמים גיליון Google Sheets כ-CSV, מדביקים כאן את הקישור והאתר יקרא ממנו.
  // אם ריק – האתר קורא מהקובץ stores.csv
  storesCsvUrl: '',

  // כלי מדידה ושיווק – נטענים רק אחרי שהגולש אישר עוגיות
  metaPixelId: '1464062874443059',      // מזהה הפיקסל של Meta (פייסבוק/אינסטגרם) – מספרים בלבד
  ga4Id: 'G-NGT9Z9JWJX',          // Google Analytics 4, בפורמט G-XXXXXXX (לא חובה)
  tiktokPixelId: '',    // פיקסל טיקטוק (לא חובה)

  // רשתות חברתיות (משאירים ריק כדי להסתיר כפתור)
  social: {
    instagram: 'https://www.instagram.com/kube_eliyahu',
    tiktok: 'https://www.tiktok.com/@kube_eliyahu',
    facebook: 'https://www.facebook.com/profile.php?id=100075824275094'
  }

};
