import type { Locale } from '@/i18n';

// Approved Editorial copy. Every public label and preview has an FR/EN version.
export const marketing = {
    "fr": {
        "navFeatures": "L’app au quotidien",
        "navBenefits": "Les avantages",
        "download": "Télécharger",
        "eyebrow": "Nutrition & fitness, à ton rythme",
        "hero1": "Mange bien.",
        "hero2": "Vis pleinement.",
        "heroBody": "Tes repas, tes séances et tes progrès, au même endroit. CalX t’accompagne de l’assiette à la course, jour après jour.",
        "getApp": "Télécharger CalX",
        "explore": "Découvrir l’application",
        "platforms": "iPhone & Android",
        "languages": "12 langues dans l’app",
        "noteTitle": "Ta journée, en un regard.",
        "noteSub": "Repas · activité · objectifs",
        "strip1": "Photographie ton repas",
        "strip2": "Bouge et suis tes séances",
        "strip3": "Avance vers ton objectif",
        "journeyEyebrow": "De l’assiette à tes progrès",
        "journeyTitle1": "Une photo.",
        "journeyTitle2": "Tout devient plus clair.",
        "journeyIntro": "Comprends ce que tu manges, retrouve tes repas et suis tes objectifs dans une même application.",
        "estimated": "Estimation du repas",
        "mealAnalyzed": "3 aliments repérés",
        "step1title": "Une photo suffit.",
        "step1body": "CalX repère les aliments et estime les calories, protéines, glucides et lipides.",
        "step2title": "Ton journal se construit.",
        "step2body": "Tes repas sont enregistrés par date et comptent dans ton objectif quotidien.",
        "step3title": "Tes progrès prennent forme.",
        "step3body": "Retrouve ton évolution et garde le cap, à ton rythme.",
        "capTitle": "Tout pour trouver ton équilibre.",
        "coachTitle": "Ton coach, à tes côtés.",
        "coachBody": "Des idées de repas et des recettes adaptées à tes envies et à tes objectifs.",
        "coachEnd": "Un coup de pouce au quotidien",
        "activityTitle": "Chaque effort compte.",
        "activityBody": "Garde une vue d’ensemble de ton activité, des calories dépensées et de ton évolution.",
        "activityEnd": "Repas et mouvement réunis",
        "exportTitle": "Tes données, à emporter.",
        "exportBody": "Télécharge tes bilans en PDF ou en Excel pour retrouver tes repas et ta progression.",
        "exportEnd": "PDF & Excel",
        "ctaTitle": "De bonnes habitudes, à ton rythme.",
        "ctaBody": "Retrouve CalX sur ton téléphone et fais le premier pas.",
        "appleSmall": "Pour iPhone et iPad",
        "googleSmall": "Pour Android",
        "privacy": "Confidentialité",
        "terms": "Conditions d’utilisation"
    },
    "en": {
        "navFeatures": "Everyday with CalX",
        "navBenefits": "The benefits",
        "download": "Get the app",
        "eyebrow": "Nutrition & fitness, made personal",
        "hero1": "Eat well.",
        "hero2": "Live fully.",
        "heroBody": "Your meals, workouts and progress in one place. From your plate to your next run, CalX is with you every day.",
        "getApp": "Download CalX",
        "explore": "Explore the app",
        "platforms": "iPhone & Android",
        "languages": "12 languages in the app",
        "noteTitle": "Your day, at a glance.",
        "noteSub": "Meals · movement · goals",
        "strip1": "Snap your meal",
        "strip2": "Move and track your workouts",
        "strip3": "Move toward your goal",
        "journeyEyebrow": "From your plate to your progress",
        "journeyTitle1": "One photo.",
        "journeyTitle2": "A clearer picture.",
        "journeyIntro": "Understand your food, find your meals and track your goals in one app.",
        "estimated": "Estimated nutrition",
        "mealAnalyzed": "3 foods identified",
        "step1title": "Start with a photo.",
        "step1body": "CalX identifies foods and estimates calories, protein, carbs and fats.",
        "step2title": "Build your food diary.",
        "step2body": "Your meals are saved by date and count toward your daily goal.",
        "step3title": "See your progress.",
        "step3body": "Follow your journey and find your rhythm, one day at a time.",
        "capTitle": "Find your everyday balance.",
        "coachTitle": "Your coach, by your side.",
        "coachBody": "Meal ideas and recipes shaped around your preferences and your goals.",
        "coachEnd": "A little everyday support",
        "activityTitle": "Every effort counts.",
        "activityBody": "Keep an overview of your activity, calories burned and progress.",
        "activityEnd": "Meals and movement together",
        "exportTitle": "Your data, ready to go.",
        "exportBody": "Download PDF or Excel reports to revisit your meals and your progress.",
        "exportEnd": "PDF & Excel",
        "ctaTitle": "Better habits, at your pace.",
        "ctaBody": "Bring CalX to your phone and take the first step.",
        "appleSmall": "For iPhone and iPad",
        "googleSmall": "For Android",
        "privacy": "Privacy",
        "terms": "Terms of use"
    }
} as const;

type PublicLabels = {
    menu: string;
    close: string;
    skip: string;
    journey: string;
    back: string;
    contents: string;
    website: string;
    contact: string;
    loading: string;
    unavailable: string;
    retry: string;
    storesError: string;
    heroAlt: string;
    mealAlt: string;
    screenshots: Record<"dashboard" | "scan" | "diary" | "progress" | "coach" | "export", string>;
};

export const publicLabels: Record<Locale, PublicLabels> = {
    "fr": {
        "menu": "Ouvrir le menu",
        "close": "Fermer le menu",
        "skip": "Aller au contenu",
        "journey": "Découvrir CalX",
        "back": "Retour à l’accueil",
        "contents": "Sur cette page",
        "website": "Site web",
        "contact": "Contact",
        "loading": "Chargement des liens de téléchargement…",
        "unavailable": "Le lien de téléchargement n’est pas encore disponible.",
        "retry": "Réessayer",
        "storesError": "Les liens de téléchargement sont momentanément indisponibles.",
        "heroAlt": "Un couple prépare un repas coloré dans une cuisine baignée de lumière dorée.",
        "mealAlt": "Œufs brouillés, pain complet et lait analysés par CalX.",
        "screenshots": {
            "dashboard": "Tableau de bord CalX : calories, macronutriments et activité.",
            "scan": "Analyse du repas : aliments, calories et macronutriments estimés.",
            "diary": "Journal alimentaire CalX avec calendrier et objectif quotidien.",
            "progress": "Évolution du poids dans CalX.",
            "coach": "Coach IA CalX : recette détaillée, ingrédients, apports nutritionnels et menu de la semaine.",
            "export": "Export des données CalX par période : PDF, Excel, téléchargement ou envoi par e-mail."
        }
    },
    "en": {
        "menu": "Open menu",
        "close": "Close menu",
        "skip": "Skip to content",
        "journey": "Explore CalX",
        "back": "Back to home",
        "contents": "On this page",
        "website": "Website",
        "contact": "Contact",
        "loading": "Loading download links…",
        "unavailable": "The download link is not available yet.",
        "retry": "Try again",
        "storesError": "Download links are temporarily unavailable.",
        "heroAlt": "A couple prepares a colourful meal in a kitchen filled with warm golden light.",
        "mealAlt": "Scrambled eggs, whole wheat toast and milk analysed by CalX.",
        "screenshots": {
            "dashboard": "CalX dashboard: calories, macros and activity.",
            "scan": "Meal analysis: identified foods and estimated calories and macros.",
            "diary": "CalX food diary with calendar and daily goal.",
            "progress": "Weight progress in CalX.",
            "coach": "CalX AI coach: recipe details, ingredients, nutrition and weekly meal plans.",
            "export": "CalX data export by period: PDF, Excel, download or email."
        }
    }
};
