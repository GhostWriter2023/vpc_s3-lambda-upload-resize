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
        displayImages(); // Refresh image lists after upload        
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
    fetch('/images/original-images')
        .then(response => response.json())
        .then(images => {
            const bucketListContainer = document.getElementById('bucketListContainer');
            const imageContainer = document.getElementById('imageContainer');

            // Clear existing content
            bucketListContainer.innerHTML = '';
            imageContainer.innerHTML = '';

            if (images.length === 0) {
                bucketListContainer.innerHTML = '<p>No images available in the bucket.</p>';
                return;
            }

            // Populate the bucket list with image names as a list
            const listTitle = document.createElement('h2');
            listTitle.textContent = 'Bucket Object List';
            bucketListContainer.appendChild(listTitle);

            const list = document.createElement('ul');
            list.classList.add('bucket-list'); // For styling the list
            images.forEach(image => {
                const listItem = document.createElement('li');
                listItem.textContent = image.Key;
                list.appendChild(listItem);
            });
            bucketListContainer.appendChild(list);

            // Populate images in the imageContainer
            images.forEach(image => {
                const imgWrapper = document.createElement('div');
                imgWrapper.classList.add('img-wrapper'); // Wrapper for styling

                const imgElement = document.createElement('img');
                imgElement.src = `/images/${image.Key}`;
                imgElement.alt = image.Key;
                imgElement.classList.add('uploaded-image'); // Style class for images

                const imgLabel = document.createElement('p');
                imgLabel.classList.add('image-label'); // Style class for labels
                imgLabel.textContent = image.Key;
                imgWrapper.appendChild(imgElement); // Append image and label to wrapper, and wrapper to image container
                imgWrapper.appendChild(imgLabel);
                imageContainer.appendChild(imgWrapper);
            });
        });

        fetch('/images/resized-images')
        .then(response => response.json())
        .then(images => {
            const resizedContainer = document.getElementById('resizedContainer');

            resizedContainer.innerHTML = '';
            const title = document.createElement('h2');
            title.textContent = 'Resized Objects';
            resizedContainer.appendChild(title);

            images.forEach(image => {
                const imgWrapper = document.createElement('div');
                imgWrapper.classList.add('img-wrapper');

                const imgElement = document.createElement('img');
                imgElement.src = `/images/${image.Key}`;
                imgElement.alt = image.Key;
                imgElement.classList.add('uploaded-image');

                const imgLabel = document.createElement('p');
                imgLabel.textContent = image.Key;
                imgWrapper.appendChild(imgElement);
                imgWrapper.appendChild(imgLabel);
                resizedContainer.appendChild(imgWrapper);
            });
        });
}

// Call displayImages on page load
document.addEventListener('DOMContentLoaded', displayImages);
