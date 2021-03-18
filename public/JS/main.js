$(function() {



    $('.confirmDelete').on('click', (e) => {
            if (!confirm('Confirm Deletion')) {
                return false;
            }
        })
        // this method is fired when the image is loaded by the adming for the product add 
    document.getElementById('productimage')
        .addEventListener('change', function() {

            var file = this.files[0];
            if (file) {
                if ((file.type == 'image/png') || (file.type == 'image/jpg') || (file.type == 'image/jpeg')) {
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        alert('image loaded susccesfully')
                        console.log(e.target.result)
                        console.log(reader.result)
                        document.getElementById('imgPreview').setAttribute('src', e.target.result)
                    }

                    reader.onerror = function(e) {
                        console.log('an occured while reading a file ')
                    }

                    reader.readAsDataURL(file)
                } else {

                    alert('please provide a png or jpeg file ')
                    return false;
                }


            }

        }, false)


    // this code is written for the dropzone    


})