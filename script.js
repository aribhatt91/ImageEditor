(function(){
    const fileInput = document.querySelector('.file-input'),
    chooseImgBtn = document.querySelector('.controls .choose-img'),
    previewImg = document.querySelector('.preview-img img')
    saveImgBtn = document.querySelector('.controls .save-img'),
    filterOptions = document.querySelectorAll('.filter .options button'),
    filter = document.querySelector('.filter'),
    filterSlider = document.querySelector('.filter .slider input'),
    filterValueLabel = filter.querySelector('.filter-info .value'),
    filterNameLabel = filter.querySelector('.filter-info .name'),
    resetAllBtn = document.querySelector('.controls .reset-filters'),
    rotateAndFlip = document.querySelector('.rotate');

    const FILTER_MAP = {
        brightness: {label: 'Brightness', value:100, max: 200},
        saturate: {label: 'Saturation', value:100, max: 200},
        invert: {label: 'Inversion', value:0, max: 100},
        grayscale: {label: 'Grayscale', value:0, max: 100}
    },
    TRANSFORM_MAP = {
        rotate: 0,
        flip: {
            x: false,
            y: false
        }
    }

    const loadImg = () => {
        let file = fileInput.files[0];
        if(!file){ return; }
        console.log(file);
        previewImg.setAttribute('src', URL.createObjectURL(file));
        if(file.name){
            previewImg.setAttribute('alt', file.name);
        }
    }

    const resetFilters = () => {
        FILTER_MAP.brightness.value = 100;
        FILTER_MAP.saturate.value = 100;
        FILTER_MAP.invert.value = 0;
        FILTER_MAP.grayscale.value = 0;
        applyFilters();
        updateFilterSlider();
        TRANSFORM_MAP.rotate = 0;
        TRANSFORM_MAP.flip.x = false;
        TRANSFORM_MAP.flip.y = false;
        applyTransformations();
    }

    const updateFilterSlider = () => {
        filterNameLabel.textContent = FILTER_MAP[filter.getAttribute('data-active')]['label'];
        filterSlider.value = FILTER_MAP[filter.getAttribute('data-active')]['value'];
        filterSlider.max = FILTER_MAP[filter.getAttribute('data-active')]['max'];
        filterValueLabel.textContent = FILTER_MAP[filter.getAttribute('data-active')]['value'] + '%';
    }

    const onFilterChange = (e) => {
        filterValueLabel.textContent = e.target.value + '%';
        FILTER_MAP[filter.getAttribute('data-active')]['value'] = e.target.value;
        applyFilters();
    }

    const applyFilters = () => {
        let filters = Object.keys(FILTER_MAP).map(f => `${f}(${FILTER_MAP[f].value}%)`);
        console.log(filters);
        previewImg.style.filter = filters.join(' ');
    }

    const applyTransformations = () => {
        previewImg.style.transform = `rotate(${TRANSFORM_MAP.rotate}deg) scale(${TRANSFORM_MAP.flip.x ? -1 : 1},${TRANSFORM_MAP.flip.y ? -1 : 1})`;
    }

    const saveImage = () => {
        const canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
        canvas.width = previewImg.naturalWidth;
        canvas.height = previewImg.naturalHeight;
        ctx.filter = Object.keys(FILTER_MAP).map(f => `${f}(${FILTER_MAP[f].value}%)`).join(' ');
        ctx.translate(canvas.width/2, canvas.height/2);
        if(TRANSFORM_MAP.rotate){
            ctx.rotate(TRANSFORM_MAP.rotate * Math.PI / 180);
        }
        ctx.scale(TRANSFORM_MAP.flip.x ? -1 : 1, TRANSFORM_MAP.flip.y ? -1 : 1)
        ctx.drawImage(previewImg, -canvas.width/2, -canvas.height/2, canvas.width, canvas.height);

        //document.body.appendChild(canvas);

        const link = document.createElement('a');
        const file = fileInput.files[0];
        link.download = file && file.name ? `${file.name}-modified.jpg` : 'image.jpg';
        link.href = canvas.toDataURL();
        link.click();
    }

    filterOptions.forEach(function(element) {
        element.addEventListener('click', function(e) {
            console.log(this);
            if(!e.target.classList.contains('btn-active')){
                document.querySelector('.filter .options button.btn-active').classList.remove('btn-active');
                this.classList.add('btn-active');
                filter.setAttribute('data-active', this.getAttribute('data-id'));
                updateFilterSlider();
            }
        })
    });

    filterSlider.addEventListener('change', onFilterChange);

    previewImg.addEventListener('load', () => {
        document.querySelector('.app').classList.remove('disabled');
        resetFilters();
    });

    rotateAndFlip.addEventListener('click', function(e){
        let target = e.target
        target = target.tagName === 'I' ? target.parentNode : target;
        if(target.tagName === 'BUTTON') {
            if(target.getAttribute('data-type') === 'rotate'){
                TRANSFORM_MAP.rotate += (Number(target.getAttribute('data-value')) || 0);
                TRANSFORM_MAP.rotate = TRANSFORM_MAP.rotate % 360;
            }else if(target.getAttribute('data-type') === 'flip') {
                TRANSFORM_MAP.flip[target.getAttribute('data-value')] = !TRANSFORM_MAP.flip[target.getAttribute('data-value')];
            }
            applyTransformations();
        }
    })

    fileInput.addEventListener('change', loadImg);

    chooseImgBtn.addEventListener('click', (e) => fileInput.click());

    resetAllBtn.addEventListener('click', resetFilters);

    saveImgBtn.addEventListener('click', saveImage);

})()