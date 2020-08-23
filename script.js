const data_meet =
{
  _id: "39cf6c52-0317-40cd-ba95-ce0a0988cc62",
  uri: "https://zoom.us/j/92057561111?pwd=VzZ1Vy9EbHJ3REJoL1ZuU3JkVzZTZz09",
  details: {
    course: "AI",
    startTime: "09.20",
    endTime: "11.00"
  },
  //change the participant here, and place the photo of participant in labeled_images folder
  participant: ['bondan', 'miftah', 'wawan', 'nicko']
}
const player = document.getElementById('player');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');

let context = canvas.getContext('2d');
var image, canvasImage

const constraints = {
  video: true,
};

captureButton.addEventListener('click', () => {
  context.drawImage(player, 0, 0, canvas.width, canvas.height)
  registered();
});

navigator.mediaDevices.getUserMedia(constraints)
  .then((stream) => {
    player.srcObject = stream;
  });


Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('models')
])

async function start() {
  const container = document.createElement('div')
  container.style.position = 'relative'
  document.body.append(container)

  const labeledFaceDescriptors = await loadLabeledImages()

  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.5)

  if (image) image.remove()

  image = new Image()
  image.id = "image"
  image.src = canvas.toDataURL("images/png")
  image.height = canvas.height
  image.width = canvas.width

  const displaySize = { width: image.width, height: image.height }
  faceapi.matchDimensions(canvas, displaySize)

  const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
  const resizedDetections = faceapi.resizeResults(detections, displaySize)

  document.body.classList.remove("loading")

  const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
  return results
}

async function registered() {
  let _isExist = false
  const results = await start();
  for (let i = 0; i < results.length; i++) {
    const res = results[i];
    if (res._label === "unknown") continue
    console.log(res)
    _isExist = true
  }
  console.log(_isExist)
  if (_isExist) window.open(data_meet.uri, '_blank')
  else alert("Anda tidak terdaftar")
}

function loadLabeledImages() {
  document.body.classList.add("loading")
  return Promise.all(
    data_meet.participant.map(async participant => {
      const img = await faceapi.fetchImage(`labeled_images/${participant}.png`)
      const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
      const descriptors = [
        new Float32Array(detections.descriptor)
      ]
      return new faceapi.LabeledFaceDescriptors(participant, descriptors)
    })
  )
}
