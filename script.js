// Inicializar la Mini App de Telegram
const tg = window.Telegram.WebApp;

let appState = {
    userInfo: null,
    debugMode: false,
    colorIndex: 0
};

const testColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Mini App de Telegram');
    initApp();
});

function initApp() {
    try {
        tg.expand();
        tg.ready();
        setupUI();
        displayUserInfo();
        setupEventListeners();
        setupMainButton();
        updateDebugInfo();
        console.log('✅ Mini App inicializada correctamente');
    } catch (error) {
        console.error('❌ Error inicializando la app:', error);
        showError('Error al inicializar la aplicación: ' + error.message);
    }
}

function setupUI() {
    tg.setHeaderColor(tg.themeParams.secondary_bg_color || '#ffffff');
    tg.setBackgroundColor(tg.themeParams.bg_color || '#ffffff');
    tg.onEvent('themeChanged', function() {
        console.log('🎨 Tema cambiado a:', tg.colorScheme);
        displayUserInfo();
        updateDebugInfo();
    });
    tg.onEvent('viewportChanged', function() {
        console.log('📱 Viewport cambió:', {
            height: tg.viewportHeight,
            stableHeight: tg.viewportStableHeight,
            isExpanded: tg.isExpanded
        });
        updateDebugInfo();
    });
}

function displayUserInfo() {
    const user = tg.initDataUnsafe?.user;
    if (user) {
        document.getElementById('usuario').textContent = 
            `${user.first_name} ${user.last_name || ''}`.trim();
        document.getElementById('userId').textContent = user.id;
        appState.userInfo = user;
    } else {
        document.getElementById('usuario').textContent = 'Usuario de Prueba';
        document.getElementById('userId').textContent = '123456789';
    }
    document.getElementById('tema').textContent = tg.colorScheme || 'desconocido';
    document.getElementById('plataforma').textContent = tg.platform || 'web';
}

function setupEventListeners() {
    document.getElementById('enviarBtn').addEventListener('click', sendMessage);
    document.getElementById('mensaje').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    document.getElementById('vibracionBtn').addEventListener('click', testVibration);
    document.getElementById('popupBtn').addEventListener('click', testPopup);
    document.getElementById('colorBtn').addEventListener('click', testColorChange);
    document.getElementById('infoBtn').addEventListener('click', showCompleteInfo);
    document.getElementById('guardarBtn').addEventListener('click', saveToStorage);
    document.getElementById('cargarBtn').addEventListener('click', loadFromStorage);
    document.getElementById('storageKey').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('storageValue').focus();
        }
    });
    document.getElementById('storageValue').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveToStorage();
        }
    });
}

function setupMainButton() {
    tg.MainButton.setText('🔄 Actualizar Info');
    tg.MainButton.show();
    tg.MainButton.onClick(function() {
        tg.HapticFeedback.impactOccurred('light');
        displayUserInfo();
        updateDebugInfo();
        tg.showAlert('✅ Información actualizada correctamente');
    });
}

function sendMessage() {
    const mensaje = document.getElementById('mensaje').value.trim();
    if (!mensaje) {
        tg.showAlert('⚠️ Por favor, escribe un mensaje');
        return;
    }
    const btn = document.getElementById('enviarBtn');
    btn.disabled = true;
    btn.textContent = 'Enviando...';
    btn.classList.add('loading');
    setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'Enviar Mensaje';
        btn.classList.remove('loading');
        tg.HapticFeedback.notificationOccurred('success');
        tg.showAlert(`✅ Mensaje enviado: "${mensaje}"`, function() {
            document.getElementById('mensaje').value = '';
        });
    }, 1500);
}

function testVibration() {
    console.log('🔸 Probando vibración...');
    tg.HapticFeedback.impactOccurred('heavy');
    tg.showAlert('📳 ¿Sentiste la vibración? (Solo funciona en móvil)');
}

function testPopup() {
    console.log('🔸 Probando popup...');
    tg.showPopup({
        title: '🎉 ¡Popup Personalizado!',
        message: 'Esta es una ventana emergente nativa de Telegram con botones personalizados.',
        buttons: [
            {id: 'cancel', type: 'cancel'},
            {id: 'info', type: 'default', text: '📚 Más Info'},
            {id: 'ok', type: 'ok', text: '✅ Genial!'}
        ]
    }, function(buttonId) {
        console.log('Usuario presionó:', buttonId);
        if (buttonId === 'info') {
            tg.openLink('https://core.telegram.org/bots/webapps', {
                try_instant_view: true
            });
        } else if (buttonId === 'ok') {
            tg.HapticFeedback.notificationOccurred('success');
        }
    });
}

function testColorChange() {
    console.log('🔸 Probando cambio de color...');
    const color = testColors[appState.colorIndex];
    appState.colorIndex = (appState.colorIndex + 1) % testColors.length;
    tg.setHeaderColor(color);
    tg.HapticFeedback.selectionChanged();
    tg.showAlert(`🎨 Color cambiado a: ${color}`);
}

function showCompleteInfo() {
    console.log('🔸 Mostrando información completa...');
    const info = getCompleteInfo();
    tg.showPopup({
        title: '📊 Información Técnica',
        message: `Versión: ${info.version}\nPlataforma: ${info.platform}\nTema: ${info.colorScheme}\nExpandida: ${info.isExpanded ? 'Sí' : 'No'}`,
        buttons: [{id: 'ok', type: 'ok'}]
    });
    updateDebugInfo();
}

function saveToStorage() {
    const key = document.getElementById('storageKey').value.trim();
    const value = document.getElementById('storageValue').value.trim();
    if (!key || !value) {
        tg.showAlert('⚠️ Por favor, llena ambos campos');
        return;
    }
    console.log('💾 Guardando en storage:', {key, value});
    tg.CloudStorage.setItem(key, value, function(err) {
        if (err) {
            console.error('Error guardando:', err);
            showStorageResult(`❌ Error: ${err}`, 'error');
        } else {
            console.log('✅ Guardado exitoso');
            tg.HapticFeedback.notificationOccurred('success');
            showStorageResult(`✅ Guardado: ${key} = ${value}`, 'success');
            document.getElementById('storageKey').value = '';
            document.getElementById('storageValue').value = '';
        }
    });
}

function loadFromStorage() {
    const key = document.getElementById('storageKey').value.trim();
    if (!key) {
        tg.showAlert('⚠️ Por favor, introduce una clave para cargar');
        return;
    }
    console.log('📥 Cargando de storage:', key);
    tg.CloudStorage.getItem(key, function(err, value) {
        if (err) {
            console.error('Error cargando:', err);
            showStorageResult(`❌ Error: ${err}`, 'error');
        } else if (value) {
            console.log('✅ Cargado exitoso:', value);
            tg.HapticFeedback.notificationOccurred('success');
            showStorageResult(`📥 Cargado: ${key} = ${value}`, 'success');
            document.getElementById('storageValue').value = value;
        } else {
            showStorageResult(`⚠️ No encontrado: ${key}`, 'warning');
        }
    });
}

function showStorageResult(message, type) {
    const resultDiv = document.getElementById('storageResult');
    resultDiv.textContent = message;
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107'
    };
    resultDiv.style.color = colors[type] || '#333';
    resultDiv.style.fontWeight = 'bold';
    setTimeout(() => {
        resultDiv.textContent = '';
        resultDiv.style.color = '';
        resultDiv.style.fontWeight = '';
    }, 5000);
}

function getCompleteInfo() {
    return {
        version: tg.version,
        platform: tg.platform,
        colorScheme: tg.colorScheme,
        isExpanded: tg.isExpanded,
        viewportHeight: tg.viewportHeight,
        viewportStableHeight: tg.viewportStableHeight,
        user: tg.initDataUnsafe?.user,
        chat: tg.initDataUnsafe?.chat,
        startParam: tg.initDataUnsafe?.start_param,
        themeParams: tg.themeParams,
        initData: tg.initData ? '[DATOS PRESENTES]' : null,
        isVersionAtLeast: tg.isVersionAtLeast('6.0'),
        BackButton: {
            isVisible: tg.BackButton.isVisible
        },
        MainButton: {
            isVisible: tg.MainButton.isVisible,
            isActive: tg.MainButton.isActive,
            text: tg.MainButton.text
        }
    };
}

function updateDebugInfo() {
    const info = getCompleteInfo();
    const formatted = JSON.stringify(info, null, 2);
    document.getElementById('debugInfo').textContent = formatted;
}

function showError(message) {
    console.error('❌', message);
    const debugDiv = document.getElementById('debugInfo');
    debugDiv.textContent = `ERROR: ${message}\n\nRevisa la consola del navegador para más detalles.`;
    debugDiv.style.color = '#dc3545';
}

window.tgDebug = {
    getCompleteInfo,
    updateDebugInfo,
    testVibration,
    testPopup,
    testColorChange,
    appState,
    tg
};

console.log('📱 Mini App de Telegram cargada. Usa window.tgDebug para debugging.');
