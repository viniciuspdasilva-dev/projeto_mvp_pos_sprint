async function getPredictions(){
    const urlBase = 'http://localhost:8000'
    const response = await fetch(`${urlBase}/predictions`);
    const data = await response.json();
    console.log(data);
    return data;
}