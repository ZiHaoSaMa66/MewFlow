const urlParams = new URLSearchParams(window.location.search);
const nd = urlParams.get("to_select_scene");


// 数据 (保持原有)
const musicStyles = [
    "流行", "摇滚", "嘻哈", "电子", "Phonk", "纯音乐", "R&B", "独立",
    "古典", "爵士", "民谣", "金属", "舞曲", "华语",
    "K-Pop", "日系", "Lo-fi", "其他"
];

const scenes = [
    "学习工作", "运动健身", "开车通勤", "睡觉前",
    "聚会派对", "一个人", "恋爱约会", "旅行路上",
    "做家务", "心情低落", "开心时", "随便听听"
];

let answers = { musicStyle: [], scene: [] };
let currentStep = 1;

// 渲染选项
function renderOptions(containerId, options, questionKey, isMultiple) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;

        btn.addEventListener('click', () => {
            if (isMultiple) {
                btn.classList.toggle('selected');
                if (btn.classList.contains('selected')) {
                    answers[questionKey].push(option);
                } else {
                    answers[questionKey] = answers[questionKey].filter(item => item !== option);
                }
                updateStyleCount();
            } else {
                document.querySelectorAll(`#${containerId} .option-btn`).forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                answers[questionKey] = [option];
            }
        });

        container.appendChild(btn);
    });
}

function updateStyleCount() {
    document.getElementById('style-count').textContent = answers.musicStyle.length;
}

function updateProgress() {
    const progress = document.getElementById('progress-fill');
    const stepText = document.getElementById('step-text');

    const percent = currentStep === 1 ? 50 : 100;
    progress.style.width = percent + '%';
    stepText.textContent = `${currentStep}/2`;
}

function showPanel(step) {
    document.getElementById('panel-1').style.display = step === 1 ? 'flex' : 'none';
    document.getElementById('panel-2').style.display = step === 2 ? 'flex' : 'none';

    document.getElementById('next-btn').style.display = step === 1 ? 'inline-block' : 'none';
    document.getElementById('submit-btn').style.display = step === 2 ? 'inline-block' : 'none';
}

function initMiniQuestionnaire() {
    renderOptions('style-options', musicStyles, 'musicStyle', true);
    renderOptions('scene-options', scenes, 'scene', false);
    updateProgress();

    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const skipBtn = document.getElementById('skip-btn');

    nextBtn.addEventListener('click', () => {
        currentStep = 2;
        updateProgress();
        showPanel(2);
    });

    submitBtn.addEventListener('click', () => {
        console.log('问卷提交:', answers);
        alert('✅ 感谢填写！\n你的音乐偏好已记录，我们会据此推荐歌曲。');
        // 可在此处添加关闭弹窗逻辑，例如：
        // if (window.parent && window.parent.closeBlockOverPage) window.parent.closeBlockOverPage();

        window.top.agent.formCallBackStart(answers.musicStyle,answers.scene)
    });

    skipBtn.addEventListener('click', () => {
        if (confirm('确定跳过吗？用两分钟完成问卷可以更好的帮我们了解您')) {
            answers = { musicStyle: [], scene: [] };
            alert('已跳过，使用默认推荐。');
            window.top.agent.formCallBackStart("","")
        }
    });

    // 确保初始显示正确
    document.getElementById('panel-1').style.display = 'flex';
    document.getElementById('panel-2').style.display = 'none';

    if (nd == "1") {
        // initMiniQuestionnaire();
        currentStep = 2;
        updateProgress();
        showPanel(2);
    };
}

console.log(nd);


window.addEventListener('load', initMiniQuestionnaire);