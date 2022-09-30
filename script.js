const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy-container');
const adjustButton = document.querySelectorAll('.adjust');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');
const lockButton = document.querySelectorAll('.lock');
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-name');
const libContainer = document.querySelector('.library-container');
const libBtn = document.querySelector('.library');
const closeLib = document.querySelector('.close-library');
const libSelect = document.querySelector('.palette-selection')

let initialColors;
let savedPalettes = [];

sliders.forEach(slider =>{
    slider.addEventListener("input", hslControls);
})

currentHexes.forEach(hex =>{
    hex.addEventListener('click', () =>{
        copyToClipboard(hex);
    })
})

popup.addEventListener('animationend', () => {
    const popupBox = popup.children[0];
    popupBox.classList.remove('active');
    popup.classList.remove('active');   
})

adjustButton.forEach((button, index) =>{
    button.addEventListener('click', () =>{
        openAdjustmentPanel(index);
    })
})

closeAdjustments.forEach((button, index) =>{
    button.addEventListener('click', () =>{
        closeAdjustmentPanel(index);
    })
})

generateBtn.addEventListener('click', randomColors)

lockButton.forEach((button, index) =>{
    button.addEventListener("click", e =>{
        lockLayer(e, index);
    })
})

saveBtn.addEventListener('click', openPalette);
closeSave.addEventListener('click', closePalette);
submitSave.addEventListener('click', savePalette);
libBtn.addEventListener('click', openlibrary);
closeLib.addEventListener('click', closelibrary);

function generateHex(){
    return chroma.random();
}

function randomColors(){
    initialColors = [];
    colorDivs.forEach((div) =>{
        const hextText = div.children[0];
        const randomColor = generateHex();
        if(div.classList.contains('.locked')){
            initialColors.push(hextText.innerHTML);
            return;
        }else{
            initialColors.push(chroma(randomColor).hex());
        }

        div.style.backgroundColor = randomColor;
        hextText.innerText = randomColor;

        checkContrast(randomColor, hextText);

        const color = chroma(randomColor);
        const sliders = div.querySelectorAll('.sliders input');
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSliders(color, hue, brightness, saturation);
    });
    resetInputs();

    adjustButton.forEach((button, index) =>{
        checkContrast(initialColors[index], button);
        checkContrast(initialColors[index], lockButton[index]);
    })
}

function checkContrast(color, text){
    const luminance = chroma(color).luminance();
    if(luminance > 0.5){
        text.style.color = "black";
    }else{
        text.style.color = "white";
    }
}

function  colorizeSliders(color, hue, brightness, saturation){
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);

    const midBright = color.set('hsl.l', 0.5);
    const scaleBright = chroma.scale(["black", midBright, "white"]);

    saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(0)}, ${scaleSat(1)})`
    brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(0.5)}, ${scaleBright(1)})`
    hue.style.backgroundImage = `linear-gradient(to right
        , rgb(204, 75, 75)
        , rgb(204, 204, 75)
        , rgb(75, 204, 75)
        , rgb(75, 204, 204)
        , rgb(75, 75, 204)
        , rgb(204, 75, 204)
        , rgb(204, 75, 75))`
}

function hslControls(e){
    const index = e.target.getAttribute("data-bright") || 
                  e.target.getAttribute("data-sat") ||
                  e.target.getAttribute("data-hue")

    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const bright = sliders[1];
    const sat = sliders[2];
    const bgColor = initialColors[index];

    let color = chroma(bgColor)
        .set('hsl.s', sat.value)
        .set('hsl.l', bright.value)
        .set('hsl.h', hue.value);
    colorDivs[index].style.backgroundColor = color;
    updateText(index)

    colorizeSliders(color, hue, bright, sat);
}

function updateText(index){
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const text = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');
    text.innerText = color.hex();

    checkContrast(color, text)
    
    for(icon of icons){
        checkContrast(color, icon)
    }
}

function resetInputs(){
    const sliders = document.querySelectorAll(".sliders input");
    sliders.forEach(slider => {
        if(slider.name === "hue"){
            const hueColor = initialColors[slider.getAttribute('data-hue')];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        }
        if(slider.name === "brightness"){
            const brightColor = initialColors[slider.getAttribute('data-bright')];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = Math.floor(brightValue * 100) / 100;
        }
        if(slider.name === "saturation"){
            const satColor = initialColors[slider.getAttribute('data-sat')];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue * 100) / 100;
        }
    });
}

function copyToClipboard(hex){
    const el = document.createElement('textarea');
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);

    const popupBox = popup.children[0];
    popupBox.classList.add("active")
    popup.classList.add("active");
}

function openAdjustmentPanel(index){
    sliderContainers[index].classList.toggle('active');
}

function closeAdjustmentPanel(index){
    sliderContainers[index].classList.remove('active');
}

function lockLayer(e, index){
    const lock = e.target.children[0];
    const activeBg = colorDivs[index];
    activeBg.classList.toggle('.locked');

    if(lock.classList.contains('fa-lock-open')){
        e.target.innerHTML = '<i class="fas fa-lock"></i>';
    }else{
        e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
    }
}

function openPalette(e){
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
    saveInput.focus();
}

function closePalette(e){
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
}

function savePalette(e){
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
    const name = saveInput.value;
    colors = [];
    currentHexes.forEach(hex => {
        colors.push(hex.innerText);
    });
    let palNum;
    const paletteObjs = JSON.parse(localStorage.getItem('palettes'));
    if(paletteObjs){
        palNum = paletteObjs.length;
    }else{
        palNum = savedPalettes.length;
    }
    const paletteObj = {
        name,
        colors,
        number: palNum
    };
    savedPalettes.push(paletteObj);

    saveToLocal(paletteObj);
    saveInput.value = "";
}

function saveToLocal(paletteObj){
    let localPalettes;
    if(localStorage.getItem('palettes') === null){
        localPalettes = [];
    }else{
        localPalettes = JSON.parse(localStorage.getItem('palettes'));
    }
    localPalettes.push(paletteObj);
    localStorage.setItem("palettes", JSON.stringify(localPalettes));

    generatePreview(paletteObj);
}

function openlibrary(){
    const popup = libContainer.children[0];
    libContainer.classList.add('active');
    popup.classList.add('active')
}

function closelibrary(){
    const popup = libContainer.children[0];
    libContainer.classList.remove('active');
    popup.classList.remove('active')
}

function getLocal(){
    if(localStorage.getItem('palettes') === null){
        localPalettes = [];
    }else{
        const paletteObjs = JSON.parse(localStorage.getItem('palettes'));
        paletteObjs.forEach(paletteObj =>{
            generatePreview(paletteObj);
        })
    }
}

function generatePreview(paletteObj){
    const palette = document.createElement('div');
    palette.classList.add('custom-palette');
    const title = document.createElement('h4');
    title.innerHTML = paletteObj.name;
    const preview = document.createElement('div');
    preview.classList.add('small-preview');
    paletteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
    });
    const createDiv = document.createElement('div');
    createDiv.classList.add('palette-btn-container');
    const paletteBtnSel = document.createElement('button');
    paletteBtnSel.classList.add('pick-palette-btn');
    paletteBtnSel.classList.add(paletteObj.number);
    paletteBtnSel.innerHTML = '<i class="fa-solid fa-check"></i>';
    const paletteBtnDel = document.createElement('button');
    paletteBtnDel.classList.add('delete-palette-btn');
    paletteBtnDel.classList.add(paletteObj.number);
    paletteBtnDel.innerHTML = '<i class="fa-solid fa-trash"></i>';

    paletteBtnSel.addEventListener('click', e =>{
        closelibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        paletteObj.colors.forEach((color, index) =>{
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkContrast(color, text);
            updateText(index);
        })
        resetInputs();
    })

    paletteBtnDel.addEventListener('click', e =>{
        let totalPalettes = document.querySelectorAll('.custom-palette');
        for(let x = 0; x < totalPalettes.length; x++){
            totalPalettes[x].classList.add(x);
        }
        
        let paletteIndex = e.target.parentElement.parentElement.classList[1];
        e.target.parentElement.parentElement.remove();

        totalPalettes.forEach((pal, index) =>{
            pal.classList.remove(index)
        })

        let item = JSON.parse(localStorage.getItem('palettes'))
        
        item.splice(paletteIndex, 1);
        item = JSON.stringify(item);
        
        localStorage.setItem('palettes', item)
    })

    palette.appendChild(title);
    palette.appendChild(preview);
    createDiv.appendChild(paletteBtnSel);
    createDiv.appendChild(paletteBtnDel);
    palette.appendChild(createDiv);
    libSelect.appendChild(palette);
}

getLocal()
randomColors();