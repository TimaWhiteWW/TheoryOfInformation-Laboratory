class UIHandler {
    constructor() {
        this.seedInput = document.getElementById('seedInput');
        this.filePicker = document.getElementById('filePicker');
        this.processBtn = document.getElementById('processBtn');
        this.fileNameDisplay = document.getElementById('fileNameDisplay');

        this.keyView = document.getElementById('keyView');
        this.sourceView = document.getElementById('sourceView');
        this.resultView = document.getElementById('resultView');

        this.selectedFile = null; // Здесь будем хранить файл после выбора
        this.init();
    }

    init() {
        // Ограничение ввода только 0 и 1
        this.seedInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^01]/g, '');
        });

        // Когда выбрали файл в окне проводника
        this.filePicker.addEventListener('change', (e) => {
            this.selectedFile = e.target.files[0];
            if (this.selectedFile) {
                this.fileNameDisplay.innerText = `📄 ${this.selectedFile.name}`;
                console.log("Файл успешно загружен в память:", this.selectedFile.name);
            } else {
                this.fileNameDisplay.innerText = "Файл не выбран";
            }
        });

        this.processBtn.addEventListener('click', () => this.handleProcess());
    }

    async handleProcess() {
        const seed = this.seedInput.value;
        if (seed.length !== 39) return alert("Введите ровно 39 бит!");

        // Проверяем нашу переменную selectedFile
        if (!this.selectedFile) return alert("Сначала выберите файл через кнопку!");

        // 1. Спрашиваем имя для сохранения
        const defaultName = "result_" + this.selectedFile.name;
        const userFileName = prompt("Введите имя файла с расширением (например, foto.png):", defaultName);

        if (userFileName === null) return; // Если нажали "Отмена" в prompt

        try {
            // 2. Читаем данные файла
            const arrayBuffer = await this.selectedFile.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);

            const lfsr = new LFSR39(seed);
            const result = new Uint8Array(data.length);

            let kBin = "", sBin = "", rBin = "";
            const limit = 200;

            for (let i = 0; i < data.length; i++) {
                const keyByte = lfsr.getNextByte();
                result[i] = data[i] ^ keyByte;

                if (i < limit) {
                    const toB = (b) => b.toString(2).padStart(8, '0');
                    kBin += toB(keyByte) + " ";
                    sBin += toB(data[i]) + " ";
                    rBin += toB(result[i]) + " ";
                }
            }

            this.keyView.value = kBin + "...";
            this.sourceView.value = sBin + "...";
            this.resultView.value = rBin + "...";

            // 3. Скачиваем
            this.download(result, userFileName);
        } catch (err) {
            console.error("Ошибка при обработке файла:", err);
            alert("Произошла ошибка при чтении файла.");
        }
    }

    download(data, name) {
        const blob = new Blob([data], {type: "application/octet-stream"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
}