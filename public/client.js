function uploadImage() {
    const imageInput = document.getElementById('imageInput');
    const file = imageInput.files[0];
    
    if (!file) {
        alert("Please select an image first.");
        return;
    }

    const formData = new FormData();
    formData.append('image', file);

    fetch('/images', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.text())
    .then(data => {
        alert(data); // Notify success
        imageInput.value = ''; // Reset the input after upload
    })
    .catch(err => {
        console.error('Error uploading image:', err);
        alert("Failed to upload image.");
    });
}

// Trigger file input on button click
document.getElementById('selectImageButton').onclick = () => {
    document.getElementById('imageInput').click();
};

function displayImages() {
    fetch('/images')
        .then(response => response.json())
        .then(images => {
            const imageContainer = document.getElementById('imageContainer');
            imageContainer.innerHTML = ''; // Clear existing images
            
            if (images.length === 0) {
                imageContainer.innerHTML = '<p>No images uploaded yet.</p>';
                return;
            }

            images.forEach(image => {
                const imgElement = document.createElement('img');
                imgElement.src = `/images/${image.Key}`; // Set the source to fetch the image
                imgElement.alt = image.Key;
                imgElement.style.width = '200px'; // Set a size for the images
                imgElement.style.margin = '10px'; // Add some margin

                imageContainer.appendChild(imgElement); // Append to the container
            });
        })
        .catch(err => {
            console.error('Error fetching images:', err);
        });
}

// Call displayImages on page load
document.addEventListener('DOMContentLoaded', displayImages);
