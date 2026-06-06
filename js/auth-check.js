/**
 * auth-check.js
 * بررسی دسترسی کاربر به هر مرحله
 * آکادمی پایتون بردیا فاتحی
 */

(function() {
    'use strict';

    // ==================== دریافت اطلاعات کاربر ====================
    function getUserData() {
        try {
            const data = localStorage.getItem('python_academy_user');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    // ==================== شماره مرحله فعلی (از URL تشخیص داده می‌شود) ====================
    function getCurrentStageNumber() {
        const url = window.location.pathname;
        const match = url.match(/stage-(\d+)\.html/);
        if (match) {
            return parseInt(match[1]);
        }
        // اگر dashboard یا index باشد
        if (url.includes('dashboard.html')) return 'dashboard';
        if (url.includes('index.html') || url === '/' || url.endsWith('/')) return 'index';
        return null;
    }

    // ==================== بررسی دسترسی ====================
    function checkAccess() {
        const stageNumber = getCurrentStageNumber();
        const userData = getUserData();

        // اگر صفحه index یا dashboard است، اجازه بده
        if (stageNumber === 'index') return true;
        if (stageNumber === 'dashboard') {
            // اگر کاربر لاگین نکرده، بره index
            if (!userData || !userData.fullName) {
                window.location.href = 'index.html';
                return false;
            }
            return true;
        }

        // برای فایل‌های stage-X.html
        if (stageNumber === null) return true; // فایل ناشناخته - اجازه بده

        // اگر کاربر لاگین نکرده
        if (!userData || !userData.fullName) {
            window.location.href = 'index.html';
            return false;
        }

        // اطمینان از وجود progress
        if (!userData.progress) {
            userData.progress = {
                currentStage: 1,
                completedStages: [],
                quizResults: {}
            };
            localStorage.setItem('python_academy_user', JSON.stringify(userData));
        }

        const currentStage = userData.progress.currentStage || 1;
        const completedStages = userData.progress.completedStages || [];

        // اگر مرحله درخواستی قبلاً تکمیل شده (بازدید مجدد آزاد است)
        if (completedStages.includes(stageNumber)) {
            return true;
        }

        // اگر مرحله درخواستی == مرحله فعلی (مجاز است)
        if (stageNumber === currentStage) {
            return true;
        }

        // اگر مرحله درخواستی > مرحله فعلی (قفل است - هدایت به مرحله فعلی)
        if (stageNumber > currentStage) {
            const redirectUrl = 'stage-' + String(currentStage).padStart(2, '0') + '.html';
            window.location.href = redirectUrl;
            return false;
        }

        // اگر مرحله درخواستی < مرحله فعلی (بازدید مجدد آزاد است)
        if (stageNumber < currentStage) {
            return true;
        }

        return true;
    }

    // ==================== نمایش نام کاربر در صورت وجود ====================
    function displayUserName() {
        const userData = getUserData();
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay && userData && userData.fullName) {
            userNameDisplay.textContent = userData.fullName;
        }
    }

    // ==================== اجرا ====================
    const accessGranted = checkAccess();
    
    if (accessGranted) {
        displayUserName();
        console.log('✅ دسترسی مجاز | آکادمی بردیا فاتحی');
    } else {
        console.warn('⛔ دسترسی غیرمجاز - در حال هدایت...');
    }

})();
