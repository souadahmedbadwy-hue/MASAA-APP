/* ==================================================
   1. تهيئة البيانات الأساسية (LocalStorage Initializer)
   ================================================== */
const initialDatabase = {
    currentUserRole: 'admin',
    users: [
        { id: 'U1', name: 'أحمد الإداري', role: 'admin' },
        { id: 'T1', name: 'أ. محمد علي', role: 'teacher', subject: 'الرياضيات' },
        { id: 'S1', name: 'عمر خالد', role: 'student', classId: 'C1', parentId: 'P1' },
        { id: 'P1', name: 'خالد عبد الله', role: 'parent', studentId: 'S1' }
    ],
    classes: [{ id: 'C1', name: 'الصف الأول الثانوي - أ' }],
    subjects: [{ id: 'SUB1', name: 'الرياضيات' }],
    lessons: [
        { 
            id: 'L1', 
            subject: 'الرياضيات', 
            teacherId: 'T1', 
            classId: 'C1', 
            date: '2026-09-27', 
            startTime: '17:00', 
            endTime: '18:00', 
            title: 'الجبر الهندسي والمصفوفات', 
            link: 'https://zoom.us/j/123456789', 
            status: 'قادم', 
            actualStart: null, 
            actualEnd: null 
        }
    ],
    studentSessions: [
        { lessonId: 'L1', studentId: 'S1', entryTime: '17:04', exitTime: '17:50', durationMinutes: 46 }
    ],
    evaluations: [
        { 
            lessonId: 'L1', 
            studentId: 'S1', 
            attendance: 'حاضر', 
            focus: 5, 
            participation: 4, 
            understanding: 5, 
            exercises: 4, 
            overall: 5, 
            homework: 'تم الحل', 
            notes: 'طالب ممتاز واهتمام ملحوظ جداً بالدرس' 
        }
    ],
    homeworks: [
        { id: 'HW1', title: 'حل تمارين الجبر صفحة 45', dueDate: '2026-09-30', status: 'تم الحل' }
    ],
    exams: [
        { id: 'EX1', title: 'اختبار شهر سبتمبر الشامل', subject: 'الرياضيات', date: '2026-10-05', duration: '60 دقيقة', link: 'https://forms.gle/exam123' }
    ],
    notifications: [
        { id: 'N1', targetRole: 'all', message: 'مرحباً بكم في منصة مسعى التعليمية المتكاملة', date: '2026-09-27' }
    ]
};

function initData() {
    if (!localStorage.getItem('masaa_db')) {
        localStorage.setItem('masaa_db', JSON.stringify(initialDatabase));
    }
}
initData();

function getDB() { return JSON.parse(localStorage.getItem('masaa_db')); }
function saveDB(data) { localStorage.setItem('masaa_db', JSON.stringify(data)); }

/* ==================================================
   2. إدارة الصلاحيات والتحقق الأمنية (RBAC)
   ================================================== */
function getCurrentRole() { return getDB().currentUserRole || 'admin'; }

function checkPermission(requiredRole) {
    const role = getCurrentRole();
    if (requiredRole === 'admin' && role !== 'admin') return false;
    if (requiredRole === 'teacher' && !['admin', 'teacher'].includes(role)) return false;
    return true;
}

function switchRole(role) {
    let db = getDB();
    db.currentUserRole = role;
    saveDB(db);
    document.getElementById('currentRoleBadge').innerText = role.toUpperCase();
    renderNavigation();
    renderDashboard();
}

/* ==================================================
   3. التحكم بالواجهات والقوائم (UI Nav Operations)
   ================================================== */
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function renderNavigation() {
    const role = getCurrentRole();
    const nav = document.getElementById('navMenu');
    let items = [];

    if (role === 'admin') {
        items = [
            { id: 'dash', label: 'لوحة التحكم', icon: 'fa-chart-line' },
            { id: 'users', label: 'إدارة المستخدمين', icon: 'fa-users' },
            { id: 'lessons', label: 'إدارة الحصص', icon: 'fa-chalkboard-teacher' },
            { id: 'exams', label: 'الامتحانات والواجبات', icon: 'fa-file-signature' },
            { id: 'reports', label: 'التقارير الشهرية', icon: 'fa-file-invoice' }
        ];
    } else if (role === 'teacher') {
        items = [
            { id: 'dash', label: 'الرئيسية', icon: 'fa-home' },
            { id: 'teacher_lessons', label: 'حصصي والجدول', icon: 'fa-calendar-alt' },
            { id: 'evaluation', label: 'تقييم الطلاب', icon: 'fa-user-check' },
            { id: 'notifs', label: 'التنبيهات', icon: 'fa-bell' }
        ];
    } else if (role === 'student') {
        items = [
            { id: 'dash', label: 'لوحة الطالب', icon: 'fa-user-graduate' },
            { id: 'student_lessons', label: 'جدولي وحصصي', icon: 'fa-book-open' },
            { id: 'student_exams', label: 'الامتحانات والواجبات', icon: 'fa-pen-alt' },
            { id: 'student_report', label: 'تقريري الشهري', icon: 'fa-chart-pie' }
        ];
    } else if (role === 'parent') {
        items = [
            { id: 'dash', label: 'متابعة الأبناء', icon: 'fa-child' },
            { id: 'monthly_report_view', label: 'التقرير الشهري', icon: 'fa-file-alt' }
        ];
    }

    nav.innerHTML = items.map(i => `
        <li class="nav-item" onclick="navigate('${i.id}')">
            <i class="fas ${i.icon}"></i>
            <span>${i.label}</span>
        </li>
    `).join('');
}

function navigate(viewId) {
    if (viewId === 'dash') renderDashboard();
    else if (viewId === 'teacher_lessons') renderTeacherLessons();
    else if (viewId === 'evaluation') renderStudentEvaluation();
    else if (viewId === 'student_report' || viewId === 'monthly_report_view' || viewId === 'reports') renderMonthlyReport('S1');
    else {
        document.getElementById('appBody').innerHTML = `
            <div class="card">
                <h3><i class="fas fa-tools"></i> القسم (${viewId}) نشط وجاهز لإضافة وحدات إضافية.</h3>
                <p style="margin-top:10px; color:#666;">يتم حفظ جميع التغيرات والبيانات بالكامل داخل localStorage.</p>
            </div>
        `;
    }
}

/* ==================================================
   4. عرض لوحات التحكم والتفاعل بحسب Role
   ================================================== */
function renderDashboard() {
    const role = getCurrentRole();
    const body = document.getElementById('appBody');
    const db = getDB();

    if (role === 'admin') {
        body.innerHTML = `
            <div class="card-grid">
                <div class="card"><div class="card-title">إجمالي الطلاب</div><div class="card-value">120</div></div>
                <div class="card"><div class="card-title">إجمالي المعلمين</div><div class="card-value">12</div></div>
                <div class="card"><div class="card-title">حصص اليوم المسجلة</div><div class="card-value">${db.lessons.length}</div></div>
                <div class="card"><div class="card-title">نسبة الحضور العامة</div><div class="card-value">96%</div></div>
            </div>
            
            <div class="table-responsive">
                <h3 style="padding:15px; background:var(--light-cream); color:var(--dark-navy);">جدول الحصص والأنشطة اليومية</h3>
                <table>
                    <thead>
                        <tr>
                            <th>المادة</th>
                            <th>المعلم</th>
                            <th>الفصل</th>
                            <th>الموعد</th>
                            <th>الرابط</th>
                            <th>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${db.lessons.map(l => `
                            <tr>
                                <td data-label="المادة">${l.subject}</td>
                                <td data-label="المعلم">أ. محمد علي</td>
                                <td data-label="الفصل">الأول الثانوي</td>
                                <td data-label="الموعد">${l.startTime} -${l.endTime}</td>
                                <td data-label="الرابط"><a href="${l.link}" target="_blank" class="btn btn-secondary" style="padding:4px 8px; font-size:0.8rem;">رابط الحصة</a></td>
                                <td data-label="الحالة"><span class="badge ${l.status==='جارية'?'badge-success':(l.status==='انتهت'?'badge-danger':'badge-warning')}">${l.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (role === 'teacher') {
        renderTeacherLessons();
    } else if (role === 'student') {
        body.innerHTML = `
            <h3>مرحباً بك الطالب: عمر خالد 🎓</h3>
            <p style="margin-bottom:20px; color:#555;">أهلاً بك في منصة مسعى | MASAA</p>
            <div class="card-grid">
                <div class="card"><div class="card-title">الحصص القادمة</div><div class="card-value">1</div></div>
                <div class="card"><div class="card-title">نسبة حضورك</div><div class="card-value">98%</div></div>
                <div class="card"><div class="card-title">الواجبات المطلوب حلها</div><div class="card-value">1</div></div>
            </div>
            <div class="card">
                <h4><i class="fas fa-video"></i> الحصة القادمة: الرياضيات</h4>
                <p style="margin:10px 0;">المعلم: أ. محمد علي | الموعد: 05:00 مساءً</p>
                <div style="display:flex; gap:10px;">
                    <button class="btn btn-primary" onclick="studentJoinLesson('L1')"><i class="fas fa-sign-in-alt"></i> دخول الحصة الآن</button>
                    <button class="btn btn-danger" onclick="studentLeaveLesson('L1')"><i class="fas fa-sign-out-alt"></i> مغادرة الحصة</button>
                </div>
            </div>
        `;
    } else if (role === 'parent') {
        body.innerHTML = `
            <h3>متابعة الابن: عمر خالد</h3>
            <p style="margin-bottom:20px;">الصف: الأول الثانوي - أ</p>
            <div class="card">
                <h4>التقرير والأداء الأكاديمي الشامل</h4>
                <p style="margin:10px 0;">يمكنك الاطلاع على كافة التفاصيل، نسب الحضور، والتقييمات الشهرية المباشرة.</p>
                <button class="btn btn-primary" onclick="renderMonthlyReport('S1')"><i class="fas fa-file-invoice"></i> عرض التقرير الشهري للابن</button>
            </div>
        `;
    }
}

/* ==================================================
   5. إدارة الحصص وتتبع زمن الحضور (Session Tracking)
   ================================================== */
function renderTeacherLessons() {
    const db = getDB();
    const body = document.getElementById('appBody');
    
    body.innerHTML = `
        <h3><i class="fas fa-chalkboard-teacher"></i> حصصي والجدول الدراسي</h3>
        <div class="card" style="margin-top:20px;">
            <h4>حصة الرياضيات - الصف الأول الثانوي</h4>
            <p style="margin:8px 0; color:#555;">الدرس: الجبر الهندسي والمصفوفات</p>
            <p><strong>الوقت المحدد:</strong> 05:00 مساءً - 06:00 مساءً</p>
            <div style="margin-top:15px; display:flex; gap:10px; flex-wrap:wrap;">
                <button class="btn btn-success" onclick="startTeacherLesson('L1')"><i class="fas fa-play"></i> بدء الحصة الآن</button>
                <button class="btn btn-danger" onclick="endTeacherLesson('L1')"><i class="fas fa-stop"></i> إنهاء الحصة</button>
                <button class="btn btn-secondary" onclick="navigate('evaluation')"><i class="fas fa-star"></i> تقييم الطلاب بعد الحصة</button>
            </div>
        </div>
    `;
}

function startTeacherLesson(lessonId) {
    let db = getDB();
    let lesson = db.lessons.find(l => l.id === lessonId);
    if (lesson) {
        const now = new Date();
        lesson.actualStart = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
        lesson.status = 'جارية';
        saveDB(db);
        alert(`تم تسجيل بداية الحصة رسمياً في الساعة: ${lesson.actualStart}`);
        renderTeacherLessons();
    }
}

function endTeacherLesson(lessonId) {
    let db = getDB();
    let lesson = db.lessons.find(l => l.id === lessonId);
    if (lesson) {
        const now = new Date();
        lesson.actualEnd = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
        lesson.status = 'انتهت';
        saveDB(db);
        alert(`تم تسجيل إنهاء الحصة في الساعة: ${lesson.actualEnd}`);
        renderTeacherLessons();
    }
}

function studentJoinLesson(lessonId) {
    let db = getDB();
    const now = new Date();
    const timeStr = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
    db.studentSessions.push({ lessonId, studentId: 'S1', entryTime: timeStr, exitTime: null, durationMinutes: 0 });
    saveDB(db);
    alert(`تم تسجـيل دخولك للحصة في الساعة: ${timeStr}`);
}

function studentLeaveLesson(lessonId) {
    let db = getDB();
    const session = db.studentSessions.find(s => s.lessonId === lessonId && s.studentId === 'S1' && !s.exitTime);
    if (session) {
        const now = new Date();
        session.exitTime = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
        session.durationMinutes = 46; // مدة محاكاة الحضور الفعلية بالدقائق
        saveDB(db);
        alert(`تم خروجك وتسجيل مدة الحضور الفعلية: 46 دقيقة`);
    }
}

/* ==================================================
   6. وحدة تقييم الطلاب (Teacher Student Evaluation)
   ================================================== */
function renderStudentEvaluation() {
    if (!checkPermission('teacher')) {
        document.getElementById('appBody').innerHTML = `<p>عذراً، لا تملك الصلاحية للوصول لهذه الصفحة.</p>`;
        return;
    }

    document.getElementById('appBody').innerHTML = `
        <h3><i class="fas fa-star"></i> تقييم أداء الطالب بعد الحصة</h3>
        <form id="evalForm" onsubmit="saveEvaluation(event)" class="card" style="margin-top:15px; max-width:600px;">
            <div class="form-group">
                <label>الطالب:</label>
                <select id="evalStudent" class="form-control"><option value="S1">عمر خالد</option></select>
            </div>
            <div class="form-group">
                <label>حالة الحضور:</label>
                <select id="evalAttend" class="form-control">
                    <option value="حاضر">حاضر</option>
                    <option value="غائب">غائب</option>
                    <option value="متأخر">متأخر</option>
                </select>
            </div>
            <div class="form-group"><label>التركيز (1 إلى 5):</label><input type="number" id="evalFocus" min="1" max="5" value="5" class="form-control"></div>
            <div class="form-group"><label>المشاركة (1 إلى 5):</label><input type="number" id="evalPart" min="1" max="5" value="4" class="form-control"></div>
            <div class="form-group"><label>الفهم (1 إلى 5):</label><input type="number" id="evalUnd" min="1" max="5" value="5" class="form-control"></div>
            <div class="form-group"><label>حل التدريبات (1 إلى 5):</label><input type="number" id="evalEx" min="1" max="5" value="4" class="form-control"></div>
            <div class="form-group"><label>حالة الواجب المنزلي:</label><input type="text" id="evalHW" value="تم الحل بنجاح" class="form-control"></div>
            <div class="form-group"><label>ملاحظات المعلم:</label><textarea id="evalNotes" class="form-control" rows="3">مستوى متميز، استجابة سريرة مع تفاعل ملحوظ.</textarea></div>
            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> حفظ التقييم تلقائياً</button>
        </form>
    `;
}

function saveEvaluation(e) {
    e.preventDefault();
    let db = getDB();
    const evalData = {
        lessonId: 'L1',
        studentId: document.getElementById('evalStudent').value,
        attendance: document.getElementById('evalAttend').value,
        focus: Number(document.getElementById('evalFocus').value),
        participation: Number(document.getElementById('evalPart').value),
        understanding: Number(document.getElementById('evalUnd').value),
        exercises: Number(document.getElementById('evalEx').value),
        overall: 5,
        homework: document.getElementById('evalHW').value,
        notes: document.getElementById('evalNotes').value
    };
    db.evaluations.push(evalData);
    saveDB(db);
    alert('تم حفظ التقييم بنجاح وتحديث بيانات التقرير الشهري للطالب.');
}

/* ==================================================
   7. التقرير الشهري والمشاركة عبر واتساب (WhatsApp Engine)
   ================================================== */
function renderMonthlyReport(studentId) {
    const db = getDB();
    const evals = db.evaluations.filter(e => e.studentId === studentId);
    const totalLessons = evals.length || 1;
    const attended = evals.filter(e => e.attendance === 'حاضر').length || 1;
    const attPerc = Math.round((attended / totalLessons) * 100);

    // الحسابات والتجميع التلقائي للمتوسطات
    const avgFocus = (evals.reduce((a,b) => a + b.focus, 0) / totalLessons).toFixed(1);
    const avgPart = (evals.reduce((a,b) => a + b.participation, 0) / totalLessons).toFixed(1);
    const avgUnd = (evals.reduce((a,b) => a + b.understanding, 0) / totalLessons).toFixed(1);
    const avgEx = (evals.reduce((a,b) => a + b.exercises, 0) / totalLessons).toFixed(1);

    const reportHTML = `
        <div class="card" id="reportCard" style="background:var(--white); padding:30px; border:2px solid var(--beige);">
            <div style="text-align:center; border-bottom:2px solid var(--beige); padding-bottom:15px; margin-bottom:20px;">
                <img src="1000194952.png" alt="MASAA" style="max-width:120px;">
                <h2 style="color:var(--dark-navy); margin-top:5px;">التقرير الشهري للطالب</h2>
                <p style="color:var(--beige); font-weight:bold;">مسعى | MASAA Online Academy</p>
            </div>

            <p style="margin-bottom:8px;"><strong>اسم الطالب:</strong> عمر خالد | <strong>الصف:</strong> الأول الثانوي - أ</p>
            <p style="margin-bottom:15px;"><strong>المادة:</strong> الرياضيات | <strong>المعلم:</strong> أ. محمد علي | <strong>الشهر:</strong> سبتمبر 2026</p>

            <h4 style="margin-top:15px; color:var(--dark-navy);"><i class="fas fa-user-check"></i> الحضور والغياب</h4>
            <p>عدد الحصص: ${totalLessons} | الحضور: ${attended} | نسبة الحضور: ${attPerc}%</p>
            <p>إجمالي مدة الحضور الفعلية: 46 دقيقة</p>

            <h4 style="margin-top:15px; color:var(--dark-navy);"><i class="fas fa-chart-bar"></i> الأداء الأكاديمي والتقييم</h4>
            <p>متوسط التركيز: ${avgFocus} / 5 ⭐⭐⭐⭐⭐</p>
            <p>متوسط المشاركة: ${avgPart} / 5 ⭐⭐⭐⭐</p>
            <p>متوسط الفهم: ${avgUnd} / 5 ⭐⭐⭐⭐⭐</p>
            <p>متوسط حل التدريبات: ${avgEx} / 5 ⭐⭐⭐⭐</p>

            <h4 style="margin-top:15px; color:var(--dark-navy);"><i class="fas fa-comment-dots"></i> ملاحظات المعلم والتوصية</h4>
            <p><strong>الملاحظات:</strong> ${evals[0]?.notes || 'أداء ممتاز واستجابة قوية'}</p>
            <p><strong>توصية الشهر القادم:</strong> مواصلة هذا الاجتهاد الممتاز للتحضير للاختبار الشامل.</p>

            <div style="margin-top:25px; display:flex; gap:12px; flex-wrap:wrap;">
                <button class="btn btn-success" onclick="sendWhatsAppReport()"><i class="fab fa-whatsapp"></i> فتح واتساب وإرسال التقرير</button>
                <button class="btn btn-secondary" onclick="copyReportText()"><i class="fas fa-copy"></i> نسخ التقرير</button>
            </div>
        </div>
    `;

    document.getElementById('appBody').innerHTML = reportHTML;
}

function generateWhatsAppText() {
    return `🎓 *مسعى | MASAA - التقرير الشهري للطالب*

*اسم الطالب:* عمر خالد
*الصف:* الأول الثانوي - أ
*المادة:* الرياضيات
*المعلم:* أ. محمد علي
*الشهر:* سبتمبر 2026

*الحضور والغياب:*
- نسبة الحضور: 100%
- مدة الحضور الفعلية: 46 دقيقة

*التقييم الأكاديمي:*
- التركيز: 5/5 ⭐
- المشاركة: 4/5 ⭐
- الفهم: 5/5 ⭐
- حل التدريبات: 4/5 ⭐

*ملاحظات المعلم:* طالب ممتاز واهتمام ملحوظ جداً بالدرس.
*توصية الشهر:* مواصلة هذا الاجتهاد الممتاز للتحضير للاختبار الشامل.`;
}

function sendWhatsAppReport() {
    const text = encodeURIComponent(generateWhatsAppText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
}

function copyReportText() {
    const text = generateWhatsAppText();
    navigator.clipboard.writeText(text).then(() => {
        alert('تم نسخ نص التقرير الشهري بنجاح إلى الحافظة.');
    });
}

/* ==================================================
   8. البحث الشامل والتهيئة الابتدائية (Search & Boot)
   ================================================== */
function handleSearch(query) {
    if (!query) return;
    console.log("جارٍ البحث عن:", query);
}

// تشغيل القائمة والواجهة الأولى
renderNavigation();
renderDashboard();