
import { prisma } from '../lib/prisma.js'

const landingPageData = {
    hero: {
        badge: "Pendaftaran Batch Baru Dibuka",
        title: "Binar Komputer Tegal",
        subtitle: "Rumah belajar komputer berbasis privat",
        description: "Mengembangkan keterampilan digital, kesiapan kerja, dan kemandirian peserta didik.",
        ctaPrimary: { text: "Lihat Program", link: "#courses" },
        ctaSecondary: { text: "Daftar Konsultasi", link: "https://wa.me/6281234567890" }
    },
    about: {
        badge: "Tentang Kami",
        title: "LKP Binar Komputer",
        description: "\"LKP Binar Komputer Tegal berdiri sejak 2016 sebagai rumah belajar komputer berbasis privat dengan pendekatan kekeluargaan dan pembelajaran personal.\""
    },
    profile: {
        title: "Profil Lembaga",
        items: [
            {
                title: "Sejarah Kami",
                description: "Binar Komputer Tegal berdiri sejak Februari 2016 sebagai bentuk kepedulian terhadap kebutuhan keterampilan komputer di dunia pendidikan dan kerja.",
                icon: "Building2",
                color: "blue"
            },
            {
                title: "Sistem Privat",
                description: "Dengan sistem belajar privat (1 guru 1 siswa atau maksimal 4 siswa), proses pembelajaran dibuat lebih fokus, efektif, dan personal.",
                icon: "Users",
                color: "purple"
            },
            {
                title: "Komitmen Kami",
                description: "Berawal dari inisiatif lima pemuda, Binar Komputer Tegal berkembang sebagai lembaga non-profit yang berkomitmen mencerdaskan masyarakat melalui pendidikan komputer yang aplikatif.",
                icon: "HeartHandshake",
                color: "orange"
            }
        ]
    },
    visionMission: {
        vision: "Menjadi partner pendidikan berkualitas berbasis kekeluargaan dalam dunia pendidikan komputer dan industri penunjangnya.",
        missions: [
            {
                title: "Kolaborasi Industri",
                description: "Kerja sama dengan praktisi pendidikan dan industri",
                icon: "Handshake",
                color: "green"
            },
            {
                title: "Peningkatan Keterampilan",
                description: "Peningkatan keterampilan komputer masyarakat, khususnya pelajar",
                icon: "Users",
                color: "purple"
            },
            {
                title: "Pembentukan Karakter",
                description: "Pembentukan mental, kreativitas, dan kemandirian",
                icon: "Smile",
                color: "orange"
            }
        ]
    },
    stats: {
        title: "Prestasi & Dampak",
        subtitle: "Bukti nyata komitmen kami dalam mencerdaskan kehidupan bangsa.",
        items: [
            {
                value: "70+",
                label: "Peserta Didik",
                description: "Dari berbagai usia telah bergabung dan belajar bersama kami.",
                icon: "Users",
                color: "blue"
            },
            {
                value: "2-3",
                label: "Bulan Siap Kerja",
                description: "Lulusan terserap bekerja, lanjut kuliah, atau berwirausaha.",
                icon: "Briefcase",
                color: "green"
            },
            {
                value: "30%",
                label: "Beasiswa Pendidikan",
                description: "Bantuan biaya bagi peserta didik yang kurang mampu.",
                icon: "Heart",
                color: "yellow"
            }
        ]
    },
    team: {
        title: "Pengajar & Pembimbing",
        description: "Didukung oleh tim pengajar dan pembimbing berpengalaman dengan struktur organisasi yang jelas, sehingga proses belajar berjalan terarah dan optimal.",
        features: [
            { title: "Berpengalaman", subtitle: "Praktisi Industri" },
            { title: "Terstruktur", subtitle: "Kurikulum Jelas" }
        ]
    },
    programs: {
        title: "Program Kami",
        subtitle: "Rencana pembelajaran terstruktur untuk masa depan yang lebih cerah.",
        items: [
            {
                title: "Program Jangka Pendek",
                description: "Motivasi belajar dan pembelajaran kilat",
                color: "blue"
            },
            {
                title: "Program Jangka Menengah",
                description: "Fokus skill Office, Desain, dan Website",
                color: "purple"
            },
            {
                title: "Program Jangka Panjang",
                description: "Pendampingan pendidikan dan kursus 1 tahun berbasis Industri 4.0",
                color: "orange"
            }
        ]
    },
    facilities: {
        title: "Fasilitas Belajar",
        subtitle: "Fasilitas lengkap untuk pengalaman belajar optimal",
        items: [
            { label: "Laptop", icon: "Monitor", color: "blue" },
            { label: "Printer", icon: "Printer", color: "orange" },
            { label: "Perpustakaan", icon: "BookOpen", color: "purple" },
            { label: "Internet", icon: "Wifi", color: "green" },
            { label: "Ruang Belajar", icon: "Home", color: "red" }
        ]
    },
    whyUs: {
        title: "Mengapa Belajar di Binar?",
        description: "Kami menggabungkan kurikulum industri dengan pendekatan personal untuk hasil belajar maksimal.",
        items: [
            {
                title: "Pendekatan Privat",
                description: "Satu mentor untuk sedikit siswa, memastikan materi tersampaikan dengan efektif dan personal.",
                icon: "Users",
                color: "blue"
            },
            {
                title: "Keterampilan Digital",
                description: "Materi yang relevan dengan kebutuhan industri saat ini, dari dasar hingga mahir.",
                icon: "Monitor",
                color: "purple"
            },
            {
                title: "Suasana Kekeluargaan",
                description: "Belajar nyaman tanpa tekanan, seperti belajar di rumah sendiri dengan mentor yang ramah.",
                icon: "Award",
                color: "orange"
            }
        ]
    },
    contact: {
        address: "Jl. Sipelem No. 22, Tegal Barat, Kota Tegal, Jawa Tengah",
        phone: "+62 812-3456-7890",
        email: "info@binarkomputer.com",
        googleMapsUrl: ""
    },
    cta: {
        title: "Mulai belajar dan berkembang bersama Binar Komputer Tegal.",
        primaryButton: { text: "Lihat Kursus", link: "/courses" },
        secondaryButton: { text: "Chat Admin", link: "https://wa.me/6281234567890" }
    },
    footer: {
        description: "Lembaga Kursus dan Pelatihan Komputer yang berfokus pada kualitas dan pendekatan kekeluargaan untuk mencetak generasi digital yang kompeten.",
        socials: []
    }
}

async function main() {
    console.log('🌱 Starting seeding process...')

    // Seed Site Settings
    console.log('📝 Seeding Site Settings...')
    await prisma.siteSettings.upsert({
        where: { key: 'landing_page' },
        update: {},
        create: {
            key: 'landing_page',
            value: landingPageData
        }
    })

    // Create Categories
    console.log('📂 Creating Categories...')
    const categories = [
        { name: 'Web Development', icon: 'Code', color: 'blue' },
        { name: 'Design', icon: 'Palette', color: 'purple' },
        { name: 'Office', icon: 'FileText', color: 'green' },
        { name: 'Programming', icon: 'Terminal', color: 'orange' },
        { name: 'Database', icon: 'Database', color: 'red' },
        { name: 'Mobile Development', icon: 'Smartphone', color: 'indigo' },
    ];

    const createdCategories = [];
    for (const cat of categories) {
        const category = await prisma.category.upsert({
            where: { name: cat.name },
            update: {},
            create: cat
        });
        createdCategories.push(category);
    }

    // Create Courses
    console.log('📚 Creating 20 Courses...')
    const courses = [
        {
            title: 'HTML & CSS Fundamental',
            slug: 'html-css-fundamental',
            description: 'Pelajari dasar-dasar pembuatan website dengan HTML dan CSS',
            shortDescription: 'Dasar pembuatan website dengan HTML & CSS',
            fullDescription: '<p>Kursus ini akan mengajarkan Anda dasar-dasar HTML dan CSS dari nol hingga dapat membuat website yang menarik.</p>',
            price: 250000,
            level: 'Beginner',
            categoryId: createdCategories[0].id,
            published: true,
            visibility: 'public',
            certificateEnabled: true,
            language: 'id',
            whatYouLearn: JSON.stringify(['Struktur HTML', 'Styling dengan CSS', 'Layout Responsive', 'Best Practices']),
            prerequisites: 'Tidak ada prasyarat',
            targetAudience: 'Pemula yang ingin belajar web development'
        },
        {
            title: 'JavaScript untuk Pemula',
            slug: 'javascript-pemula',
            description: 'Menguasai bahasa pemrograman JavaScript dari dasar',
            shortDescription: 'Belajar JavaScript dari nol',
            fullDescription: '<p>Kuasai JavaScript, bahasa pemrograman paling populer untuk web development.</p>',
            price: 300000,
            level: 'Beginner',
            categoryId: createdCategories[0].id,
            published: true,
            visibility: 'public',
            certificateEnabled: true,
            language: 'id',
            whatYouLearn: JSON.stringify(['Variabel dan Data Types', 'Functions', 'DOM Manipulation', 'ES6 Features']),
            prerequisites: 'Dasar HTML & CSS',
            targetAudience: 'Yang sudah memahami HTML & CSS'
        },
        {
            title: 'React.js Modern Development',
            slug: 'reactjs-modern',
            description: 'Belajar membuat aplikasi web modern dengan React.js',
            shortDescription: 'Build modern web apps dengan React',
            fullDescription: '<p>Pelajari cara membuat single page application (SPA) dengan React.js dan tools modern lainnya.</p>',
            price: 500000,
            level: 'Intermediate',
            categoryId: createdCategories[0].id,
            published: true,
            visibility: 'public',
            certificateEnabled: true,
            language: 'id',
            whatYouLearn: JSON.stringify(['React Components', 'Hooks', 'State Management', 'React Router']),
            prerequisites: 'JavaScript dasar',
            targetAudience: 'Developer yang ingin menguasai React'
        },
        {
            title: 'Node.js & Express Backend',
            slug: 'nodejs-express-backend',
            description: 'Membangun RESTful API dengan Node.js dan Express',
            shortDescription: 'Backend development dengan Node.js',
            fullDescription: '<p>Pelajari cara membangun server-side application dengan Node.js dan Express framework.</p>',
            price: 450000,
            level: 'Intermediate',
            categoryId: createdCategories[3].id,
            published: true,
            visibility: 'public',
            certificateEnabled: true,
            language: 'id',
            whatYouLearn: JSON.stringify(['Node.js Basics', 'Express Framework', 'RESTful API', 'Authentication']),
            prerequisites: 'JavaScript intermediate',
            targetAudience: 'Developer yang ingin belajar backend'
        },
        {
            title: 'Adobe Photoshop Mastery',
            slug: 'photoshop-mastery',
            description: 'Kuasai Adobe Photoshop untuk desain grafis profesional',
            shortDescription: 'Desain grafis dengan Photoshop',
            fullDescription: '<p>Pelajari teknik editing foto dan desain grafis menggunakan Adobe Photoshop.</p>',
            price: 350000,
            level: 'Beginner',
            categoryId: createdCategories[1].id,
            published: true,
            visibility: 'public',
            certificateEnabled: true,
            language: 'id',
            whatYouLearn: JSON.stringify(['Photo Editing', 'Layer Techniques', 'Typography', 'Color Grading']),
            prerequisites: 'Tidak ada',
            targetAudience: 'Pemula yang ingin belajar desain grafis'
        },
        {
            title: 'UI/UX Design Fundamentals',
            slug: 'uiux-design-fundamentals',
            description: 'Prinsip dasar desain antarmuka dan pengalaman pengguna',
            shortDescription: 'Dasar-dasar UI/UX Design',
            fullDescription: '<p>Pelajari prinsip desain yang baik dan cara membuat user interface yang menarik dan user-friendly.</p>',
            price: 400000,
            level: 'Beginner',
            categoryId: createdCategories[1].id,
            published: true,
            visibility: 'public',
            certificateEnabled: true,
            language: 'id',
            whatYouLearn: JSON.stringify(['Design Principles', 'Wireframing', 'Prototyping', 'User Research']),
            prerequisites: 'Tidak ada',
            targetAudience: 'Calon UI/UX Designer'
        },
        {
            title: 'Microsoft Excel Advanced',
            slug: 'excel-advanced',
            description: 'Tingkatkan produktivitas dengan Excel tingkat lanjut',
            shortDescription: 'Excel untuk profesional',
            fullDescription: '<p>Kuasai fitur-fitur advanced Excel untuk analisis data dan otomasi pekerjaan.</p>',
            price: 280000,
            level: 'Intermediate',
            categoryId: createdCategories[2].id,
            published: true,
            visibility: 'public',
            certificateEnabled: true,
            language: 'id',
            whatYouLearn: JSON.stringify(['Pivot Tables', 'VLOOKUP & HLOOKUP', 'Macros', 'Data Analysis']),
            prerequisites: 'Excel dasar',
            targetAudience: 'Profesional yang menggunakan Excel'
        },
        {
            title: 'Microsoft Word Professional',
            slug: 'word-professional',
            description: 'Membuat dokumen profesional dengan Microsoft Word',
            shortDescription: 'Word untuk dokumen profesional',
            fullDescription: '<p>Pelajari cara membuat dokumen bisnis dan akademis yang profesional dengan Microsoft Word.</p>',
            price: 200000,
            level: 'Beginner',
            categoryId: createdCategories[2].id,
            published: true,
            visibility: 'public',
            certificateEnabled: true,
            language: 'id',
            whatYouLearn: JSON.stringify(['Templates', 'Styles & Formatting', 'Mail Merge', 'Table of Contents']),
            prerequisites: 'Tidak ada',
            targetAudience: 'Pemula untuk profesional'
        },
        {
            title: 'Python Programming Basics',
            slug: 'python-basics',
            description: 'Belajar pemrograman Python dari nol',
            shortDescription: 'Pemrograman Python untuk pemula',
            fullDescription: '<p>Python adalah bahasa pemrograman yang mudah dipelajari dan sangat powerful. Mulai journey programming Anda di sini!</p>',
            price: 350000,
            level: 'Beginner',
            categoryId: createdCategories[3].id,
            published: true,
            visibility: 'public',
            certificateEnabled: true,
            language: 'id',
            whatYouLearn: JSON.stringify(['Python Syntax', 'Data Structures', 'Functions', 'OOP Basics']),
            prerequisites: 'Tidak ada',
            targetAudience: 'Pemula yang ingin belajar programming'
        },
        {
            title: 'MySQL Database Management',
            slug: 'mysql-database',
            description: 'Mengelola database dengan MySQL',
            shortDescription: 'Database management dengan MySQL',
            fullDescription: '<p>Pelajari cara mendesain, membuat, dan mengelola database relasional dengan MySQL.</p>',
            price: 320000,
            level: 'Intermediate',
            categoryId: createdCategories[4].id,
            published: true,
            visibility: 'public',
            certificateEnabled: true,
            language: 'id',
            whatYouLearn: JSON.stringify(['SQL Queries', 'Database Design', 'Joins', 'Optimization']),
            prerequisites: 'Dasar programming',
            targetAudience: 'Developer yang perlu menggunakan database'
        },
        {
            title: 'Flutter Mobile App Development',
            slug: 'flutter-mobile-app',
            description: 'Membuat aplikasi mobile cross-platform dengan Flutter',
            shortDescription: 'Build mobile apps dengan Flutter',
            fullDescription: '<p>Flutter memungkinkan Anda membuat aplikasi iOS dan Android dari satu codebase. Pelajari di sini!</p>',
            price: 550000,
            level: 'Intermediate',
            categoryId: createdCategories[5].id,
            published: true,
            visibility: 'public',
            certificateEnabled: true,
            language: 'id',
            whatYouLearn: JSON.stringify(['Flutter Widgets', 'State Management', 'Navigation', 'API Integration']),
            prerequisites: 'Dasar programming',
            targetAudience: 'Developer yang ingin membuat mobile apps'
        },
        {
            title: 'Git & GitHub untuk Developer',
            slug: 'git-github-developer',
            description: 'Version control dengan Git dan kolaborasi di GitHub',
            shortDescription: 'Version control dengan Git',
            fullDescription: '<p>Git adalah tools wajib untuk developer modern. Pelajari cara menggunakan Git dan GitHub secara profesional.</p>',
            price: 180000,
            level: 'Beginner',
            categoryId: createdCategories[3].id,
            published: true,
            visibility: 'public',
            certificateEnabled: true,
            language: 'id',
            whatYouLearn: JSON.stringify(['Git Commands', 'Branching', 'Pull Requests', 'Collaboration']),
            prerequisites: 'Tidak ada',
            targetAudience: 'Semua developer'
        },
        {
            title: 'WordPress Website Development',
            slug: 'wordpress-development',
            description: 'Membuat website profesional dengan WordPress',
            shortDescription: 'Website dengan WordPress',
            fullDescription: '<p>WordPress adalah CMS paling populer di dunia. Pelajari cara membuat website bisnis dan blog dengan WordPress.</p>',
            price: 280000,
            level: 'Beginner',
            categoryId: createdCategories[0].id,
            published: true,
            visibility: 'public',
            certificateEnabled: true,
            language: 'id',
            whatYouLearn: JSON.stringify(['WordPress Installation', 'Themes & Plugins', 'Content Management', 'SEO Basics']),
            prerequisites: 'Tidak ada',
            targetAudience: 'Yang ingin membuat website tanpa coding'
        },
        {
            title: 'Figma for UI Design',
            slug: 'figma-ui-design',
            description: 'Desain antarmuka modern dengan Figma',
            shortDescription: 'UI Design dengan Figma',
            fullDescription: '<p>Figma adalah tools desain UI/UX berbasis cloud yang powerful. Pelajari cara menggunakannya secara profesional.</p>',
            price: 320000,
            level: 'Beginner',
            categoryId: createdCategories[1].id,
            published: true,
            visibility: 'public',
            certificateEnabled: true,
            language: 'id',
            whatYouLearn: JSON.stringify(['Figma Interface', 'Components', 'Auto Layout', 'Prototyping']),
            prerequisites: 'Tidak ada',
            targetAudience: 'Designer dan developer'
        },
        {
            title: 'TypeScript Fundamentals',
            slug: 'typescript-fundamentals',
            description: 'JavaScript dengan tipe data yang lebih aman',
            shortDescription: 'Belajar TypeScript',
            fullDescription: '<p>TypeScript membuat JavaScript lebih scalable dan maintainable. Essential untuk project besar!</p>',
            price: 350000,
            level: 'Intermediate',
            categoryId: createdCategories[3].id,
            published: true,
            visibility: 'public',
            certificateEnabled: true,
            language: 'id',
            whatYouLearn: JSON.stringify(['Type System', 'Interfaces', 'Generics', 'Advanced Types']),
            prerequisites: 'JavaScript intermediate',
            targetAudience: 'JavaScript developer'
        },
        {
            title: 'Next.js Full Stack Development',
            slug: 'nextjs-fullstack',
            description: 'Framework React untuk production-ready apps',
            shortDescription: 'Full stack dengan Next.js',
            fullDescription: '<p>Next.js adalah framework React paling populer untuk membuat aplikasi full stack modern.</p>',
            price: 580000,
            level: 'Advanced',
            categoryId: createdCategories[0].id,
            published: true,
            visibility: 'public',
            certificateEnabled: true,
            language: 'id',
            whatYouLearn: JSON.stringify(['SSR & SSG', 'API Routes', 'App Router', 'Deployment']),
            prerequisites: 'React.js',
            targetAudience: 'React developer'
        },
        {
            title: 'Docker untuk Developer',
            slug: 'docker-developer',
            description: 'Containerization untuk development modern',
            shortDescription: 'Containerization dengan Docker',
            fullDescription: '<p>Docker adalah standard untuk containerization. Pelajari cara menggunakan Docker dalam development workflow.</p>',
            price: 380000,
            level: 'Intermediate',
            categoryId: createdCategories[3].id,
            published: true,
            visibility: 'public',
            certificateEnabled: true,
            language: 'id',
            whatYouLearn: JSON.stringify(['Docker Basics', 'Images & Containers', 'Docker Compose', 'Best Practices']),
            prerequisites: 'Linux basics',
            targetAudience: 'Backend developer'
        },
        {
            title: 'Tailwind CSS Framework',
            slug: 'tailwind-css-framework',
            description: 'Utility-first CSS framework untuk UI modern',
            shortDescription: 'Styling dengan Tailwind CSS',
            fullDescription: '<p>Tailwind CSS adalah framework CSS yang memudahkan styling dengan utility classes.</p>',
            price: 250000,
            level: 'Beginner',
            categoryId: createdCategories[0].id,
            published: true,
            visibility: 'public',
            certificateEnabled: true,
            language: 'id',
            whatYouLearn: JSON.stringify(['Utility Classes', 'Responsive Design', 'Custom Configuration', 'Components']),
            prerequisites: 'HTML & CSS dasar',
            targetAudience: 'Web developer'
        },
        {
            title: 'Data Analysis dengan Python',
            slug: 'data-analysis-python',
            description: 'Analisis data menggunakan Pandas dan NumPy',
            shortDescription: 'Data analysis dengan Python',
            fullDescription: '<p>Pelajari cara menganalisis dan memvisualisasikan data menggunakan Python dan library populernya.</p>',
            price: 420000,
            level: 'Intermediate',
            categoryId: createdCategories[3].id,
            published: true,
            visibility: 'public',
            certificateEnabled: true,
            language: 'id',
            whatYouLearn: JSON.stringify(['Pandas', 'NumPy', 'Data Visualization', 'Data Cleaning']),
            prerequisites: 'Python basics',
            targetAudience: 'Data analyst pemula'
        },
        {
            title: 'REST API Design & Best Practices',
            slug: 'rest-api-design',
            description: 'Merancang RESTful API yang baik dan scalable',
            shortDescription: 'RESTful API design',
            fullDescription: '<p>Pelajari prinsip-prinsip dan best practices dalam merancang RESTful API yang scalable dan maintainable.</p>',
            price: 380000,
            level: 'Intermediate',
            categoryId: createdCategories[3].id,
            published: true,
            visibility: 'public',
            certificateEnabled: true,
            language: 'id',
            whatYouLearn: JSON.stringify(['REST Principles', 'API Versioning', 'Authentication', 'Documentation']),
            prerequisites: 'Backend basics',
            targetAudience: 'Backend developer'
        },
    ];

    const createdCourses = [];
    for (const courseData of courses) {
        const course = await prisma.course.create({
            data: courseData
        });
        createdCourses.push(course);
        console.log(`  ✅ Created course: ${course.title}`);

        // Add 2-3 modules per course
        const moduleCount = Math.floor(Math.random() * 2) + 2; // 2-3 modules
        for (let i = 0; i < moduleCount; i++) {
            const module = await prisma.module.create({
                data: {
                    title: `Modul ${i + 1}: ${['Pengenalan', 'Praktik', 'Lanjutan'][i] || 'Advanced'}`,
                    description: `Materi ${['dasar', 'praktis', 'lanjutan'][i] || 'advanced'} untuk ${course.title}`,
                    order: i + 1,
                    courseId: course.id
                }
            });

            // Add 3-5 lessons per module
            const lessonCount = Math.floor(Math.random() * 3) + 3; // 3-5 lessons
            for (let j = 0; j < lessonCount; j++) {
                await prisma.lesson.create({
                    data: {
                        title: `Pelajaran ${j + 1}`,
                        contentType: ['video', 'text', 'quiz'][Math.floor(Math.random() * 3)],
                        content: '<p>Konten pelajaran akan ditambahkan di sini.</p>',
                        duration: Math.floor(Math.random() * 30) + 10, // 10-40 minutes
                        order: j + 1,
                        moduleId: module.id
                    }
                });
            }
        }
    }

    // Create Quizzes
    console.log('📝 Creating 20 Quizzes...')
    const quizzes = [
        {
            title: 'HTML Basics Quiz',
            description: 'Test pemahaman dasar HTML',
            type: 'practice',
            passingScore: 70,
            status: 'published'
        },
        {
            title: 'CSS Fundamentals Test',
            description: 'Uji kemampuan CSS fundamental',
            type: 'practice',
            passingScore: 70,
            status: 'published'
        },
        {
            title: 'JavaScript Basics Assessment',
            description: 'Tes pemahaman JavaScript dasar',
            type: 'assessment',
            passingScore: 75,
            status: 'published',
            timeLimit: 30
        },
        {
            title: 'React Components Quiz',
            description: 'Quiz tentang React components',
            type: 'practice',
            passingScore: 70,
            status: 'published'
        },
        {
            title: 'Node.js Fundamentals',
            description: 'Test dasar-dasar Node.js',
            type: 'practice',
            passingScore: 70,
            status: 'published'
        },
        {
            title: 'Photoshop Tools Test',
            description: 'Ujian penggunaan tools Photoshop',
            type: 'assessment',
            passingScore: 75,
            status: 'published',
            timeLimit: 25
        },
        {
            title: 'UI/UX Principles Quiz',
            description: 'Quiz prinsip-prinsip UI/UX',
            type: 'practice',
            passingScore: 70,
            status: 'published'
        },
        {
            title: 'Excel Formulas Test',
            description: 'Tes formula dan fungsi Excel',
            type: 'assessment',
            passingScore: 80,
            status: 'published',
            timeLimit: 40
        },
        {
            title: 'Python Syntax Quiz',
            description: 'Quiz tentang syntax Python',
            type: 'practice',
            passingScore: 70,
            status: 'published'
        },
        {
            title: 'SQL Queries Assessment',
            description: 'Test kemampuan menulis SQL queries',
            type: 'assessment',
            passingScore: 75,
            status: 'published',
            timeLimit: 35
        },
        {
            title: 'Flutter Widgets Quiz',
            description: 'Quiz tentang Flutter widgets',
            type: 'practice',
            passingScore: 70,
            status: 'published'
        },
        {
            title: 'Git Commands Test',
            description: 'Tes perintah-perintah Git',
            type: 'practice',
            passingScore: 70,
            status: 'published'
        },
        {
            title: 'WordPress Basics Quiz',
            description: 'Quiz dasar-dasar WordPress',
            type: 'practice',
            passingScore: 70,
            status: 'published'
        },
        {
            title: 'Figma Features Test',
            description: 'Test fitur-fitur Figma',
            type: 'assessment',
            passingScore: 75,
            status: 'published',
            timeLimit: 30
        },
        {
            title: 'TypeScript Types Quiz',
            description: 'Quiz tentang TypeScript type system',
            type: 'practice',
            passingScore: 70,
            status: 'published'
        },
        {
            title: 'Next.js Concepts Test',
            description: 'Test konsep-konsep Next.js',
            type: 'assessment',
            passingScore: 75,
            status: 'published',
            timeLimit: 30
        },
        {
            title: 'Docker Basics Quiz',
            description: 'Quiz dasar-dasar Docker',
            type: 'practice',
            passingScore: 70,
            status: 'published'
        },
        {
            title: 'Tailwind CSS Quiz',
            description: 'Quiz tentang Tailwind CSS utilities',
            type: 'practice',
            passingScore: 70,
            status: 'published'
        },
        {
            title: 'Data Analysis Basics',
            description: 'Test dasar analisis data',
            type: 'assessment',
            passingScore: 75,
            status: 'published',
            timeLimit: 40
        },
        {
            title: 'REST API Design Quiz',
            description: 'Quiz tentang REST API best practices',
            type: 'practice',
            passingScore: 70,
            status: 'published'
        },
    ];

    const questionTemplates = [
        {
            question: 'Apa fungsi dari tag {topic}?',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 'Option A',
            explanation: 'Penjelasan singkat tentang jawaban yang benar.'
        },
        {
            question: 'Manakah yang merupakan {concept} yang benar?',
            options: ['Pilihan 1', 'Pilihan 2', 'Pilihan 3', 'Pilihan 4'],
            correctAnswer: 'Pilihan 1',
            explanation: 'Ini adalah penjelasan mengapa pilihan ini benar.'
        },
        {
            question: 'Bagaimana cara menggunakan {feature}?',
            options: ['Cara A', 'Cara B', 'Cara C', 'Cara D'],
            correctAnswer: 'Cara A',
            explanation: 'Penjelasan detail tentang penggunaan yang benar.'
        },
        {
            question: 'Apa perbedaan antara {item1} dan {item2}?',
            options: ['Perbedaan A', 'Perbedaan B', 'Perbedaan C', 'Perbedaan D'],
            correctAnswer: 'Perbedaan A',
            explanation: 'Penjelasan tentang perbedaan keduanya.'
        },
        {
            question: 'Kapan sebaiknya menggunakan {technique}?',
            options: ['Situasi 1', 'Situasi 2', 'Situasi 3', 'Situasi 4'],
            correctAnswer: 'Situasi 1',
            explanation: 'Penjelasan kapan teknik ini paling efektif.'
        },
    ];

    for (const [index, quizData] of quizzes.entries()) {
        const quiz = await prisma.quiz.create({
            data: quizData
        });
        console.log(`  ✅ Created quiz: ${quiz.title}`);

        // Add 5-8 questions per quiz
        const questionCount = Math.floor(Math.random() * 4) + 5; // 5-8 questions
        for (let i = 0; i < questionCount; i++) {
            const template = questionTemplates[i % questionTemplates.length];
            await prisma.question.create({
                data: {
                    quizId: quiz.id,
                    type: 'multiple_choice',
                    question: template.question.replace('{topic}', quizData.title.split(' ')[0]),
                    options: JSON.stringify(template.options),
                    correctAnswer: template.correctAnswer,
                    explanation: template.explanation,
                    score: 10,
                    order: i + 1
                }
            });
        }
    }

    console.log('✨ Seeding completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - ${createdCategories.length} categories`)
    console.log(`   - ${createdCourses.length} courses`)
    console.log(`   - ${quizzes.length} quizzes`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('❌ Seeding failed:', e)
        await prisma.$disconnect()
        process.exit(1)
    })
