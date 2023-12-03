function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

const aparelhosInteligentes = document.getElementById('aparelhosInteligentes');
const medidoreEnergia = document.getElementById('medidoreEnergia');
const dispositivosVestiveis = document.getElementById('dispositivosVestiveis');
const dispositivosSaude = document.getElementById('dispositivosSaude');

async function wait(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function animateAlvos() {
    animateValue(aparelhosInteligentes, 0, 37, 1000);
    await wait(1000);

    animateValue(medidoreEnergia, 0, 25, 1000);
    await wait(1000);

    animateValue(dispositivosVestiveis, 0, 13, 1000);
    await wait(1000);

    animateValue(dispositivosSaude, 0, 10, 1000);
}

let alreadyReached = false;

const observer = new window.IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !alreadyReached) {
        animateAlvos();
        alreadyReached = true;
        return
    }
}, {
    root: null,
    threshold: 0,
})

observer.observe(document.querySelector('#infos'))
