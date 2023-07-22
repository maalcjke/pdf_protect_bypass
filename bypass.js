var waitSeconds = 500; // задержка в миллисекундах

// Загружаем html2canvas и jszip через CDN
async function loadScripts(urls) {
    return Promise.all(
        urls.map((url) => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = url;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        })
    );
}

// Функция для создания изображения из содержимого элемента с помощью html2canvas
async function captureElementAsImage(element, i) {
    await sleep(waitSeconds * i);
    element.scrollIntoView();
    console.log(`Захватываем изображение ${i + 1}...`);
    
    return html2canvas(element).then((canvas) => {
        return canvas.toDataURL('image/png');
    });
}

async function captureAllElementsInViewer() {
    const elements = document.querySelectorAll('.viewer .canvasWrapper');
    const promises = [];

    for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        promises.push(captureElementAsImage(element, index));
    }

    return Promise.all(promises);
}

async function saveImagesAsZip() {
    try {
        const images = await captureAllElementsInViewer();
        console.log("Все изображения успешно захвачены!");

        // Создаем архив и сохраняем в него изображения
        const zip = new JSZip();

        images.forEach((image, index) => {
            zip.file(`image${index + 1}.png`, image.substr(image.indexOf(',') + 1), { base64: true });
        });

        // Генерируем архив
        const content = await zip.generateAsync({ type: 'blob' });

        // Сохраняем архив как файл
        const zipFileName = document.title + '.zip';
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = zipFileName;
        a.click();
    } catch (error) {
        console.error('Произошла ошибка при сохранении изображений:', error);
    }
}

// Функция для ожидания заданного времени
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Загружаем необходимые библиотеки и запускаем процесс сохранения изображений
loadScripts([
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.5.0-beta4/html2canvas.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.6.0/jszip.min.js'
])
    .then(() => {
        // Запускаем процесс сохранения содержимого элементов в архив
        saveImagesAsZip();
    })
    .catch((error) => {
        console.error('Не удалось загрузить необходимые библиотеки:', error);
    });
