// Access token ve refresh token'ları local storage'e kaydetme işlemi
function saveTokensToLocalStorage(access_token, refresh_token) {
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
}

// Kullanıcı girişi işlemi
async function loginUser(username, password) {
    try {
        const response = await fetch('http://127.0.0.1:8000/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
            mode: 'cors',
            credentials: 'include',
        });

        const data = await response.json();
        console.log(data);

        if (data.access_token && data.refresh_token) {
            // Tokenları local storage'e kaydet
            saveTokensToLocalStorage(data.access_token, data.refresh_token);
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
//logout
async function logout() {
    const accessToken = getAccessToken();

    if (accessToken) {
        try {
            const response = await fetch('http://127.0.0.1:8000/logout/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                mode: 'cors',
                credentials: 'include',
            });

            if (response.ok) {
                // Oturumu başarıyla kapattıktan sonra yapılacak işlemler
                console.log('Oturum başarıyla kapatıldı.');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = 'login.html';
            } else {
                // Oturumu kapatma başarısız olduysa hata mesajını logla
                console.error('Oturumu kapatma hatası:', response.statusText);
            }
        } catch (error) {
            // Ağ hatası durumunda hatayı logla
            console.error('Network hatası:', error);
        }
    } else {
        // Eğer erişim belirteci (access token) bulunamazsa
        console.error('Erişim belirteci bulunamadı.');
    }
}


//register işlemi
function registerUser(username, email, password) {

    fetch('http://127.0.0.1:8000/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password,
        }),
        mode: 'cors',
        credentials: 'include',
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => console.error('Error:', error));
}

// Access token'ı local storage'dan almak için bir yardımcı fonksiyon
function getAccessToken() {
    return localStorage.getItem('access_token');
}

//istekler giderken access token pasife düşerse logine yönlendiriyoruz
function handleTokenValidationResponse(data) {
    if (data.detail === 'Given token not valid for any token type' && data.code === 'token_not_valid') {
        // Eğer token geçerli değilse, login.html sayfasına yönlendir
        window.location.href = 'login.html';
    }
}


// Access token kontrolü için
async function checkAccessTokenExpiry() {
    const accessToken = getAccessToken();

    if (accessToken) {
        try {
            const response = await fetch('http://127.0.0.1:8000/verify-token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                mode: 'cors',
                credentials: 'include',
            });

            const data = await response.json();
            console.log(data)

            if (response.ok && data.message === 'Token doğrulama başarılı.') {
            } else {
                // Token doğrulama başarısız veya başka bir hata, giriş formunu göster
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = 'login.html';
            }

        } catch (error) {
            console.error('Hata:', error);
        }
    } else {
        if (window.location.href.indexOf('login.html') === -1) {
            window.location.href = 'login.html';
        }
    }
}

// DataTable'ı yeniden çizen fonksiyon
function redrawTable(data) {
    const table = $('#ihaTable').DataTable({
        destroy: true, // DataTables'i yeniden başlat
        data: data, // Verileri tabloya ekle
        columns: [
            { data: 'id' },
            { data: 'brand' },
            { data: 'model' },
            { data: 'weight' },
            { data: 'category' },
            {
                data: null, render: function (data, type, row) {
                    return `
                    <button class="btn btn-danger" onclick="deleteIHA(${row.id})">Sil</button>
                    <button class="btn btn-info" onclick="editIHA(${row.id})">Düzenle</button>
                    <button class="btn btn-success" onclick="rentIHAhtml(${row.id})">Kirala</button>`;

                }
            }
        ]
    });

    // DataTables'i yeniden çiz
    table.draw();
}

// IHA'ları listeleme işlemi
async function listIHAs() {
    const accessToken = getAccessToken();

    if (accessToken) {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/ihalar/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                mode: 'cors',
                credentials: 'include',
            });

            const data = await response.json();
            console.log('Liste:', data);

            // DataTable'ı yeniden çiz
            redrawTable(data);
        } catch (error) {
            console.error('Hata:', error);
        }
    } else {
        console.error('Access token bulunamadı.');
    }
}

// IHA ekleme işlemi
async function addIHA(brand, model, weight, category) {
    const accessToken = getAccessToken();
    if (accessToken) {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/ihalar/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify({
                    brand: brand,
                    category: category,
                    model: model,
                    weight: weight,

                }),
            });
            if (response.ok) {
                // If the deletion was successful, reload the DataTable
                const data = await response.json();
                console.log('Ekleme:', data);
                window.location.href = 'iha.html';
                listIHAs();
            } else {
                // If there was an error in the deletion, log the error
                console.error('IHA ekleme hatası:', response.statusText);
            }


        } catch (error) {
            console.error('Hata:', error);
        }
    } else {
        console.error('Access token bulunamadı.');
    }
}

//IHA silme işlemi
async function deleteIHA(ihaId) {
    const accessToken = getAccessToken();

    if (accessToken) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/ihalar/${ihaId}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                mode: 'cors',
                credentials: 'include',
            });
            if (response.ok) {
                // If the deletion was successful, reload the DataTable
                console.log('IHA başarıyla silindi.');
                listIHAs();
            } else {
                // If there was an error in the deletion, log the error
                console.error('IHA silme hatası:', response.statusText);
            }
        } catch (error) {
            // If there was a network error, log the error
            console.error('Network hatası:', error);
        }
    } else {
        // Access token not found
        console.error('Access token bulunamadı.');
    }
}

// İHA'nın bilgilerini getiren fonksiyon
async function getIHAInfoById(ihaId) {
    const accessToken = getAccessToken(); // Access token'ı al

    if (accessToken) {
        try {
            // IHA'nın bilgilerini getiren GET isteği
            const response = await fetch(`http://127.0.0.1:8000/api/ihalar/${ihaId}/get_iha_info_by_id/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                mode: 'cors',
                credentials: 'include',
            });

            // İsteğin başarılı olup olmadığını kontrol et
            if (response.ok) {
                // JSON verisini al ve kullan
                const data = await response.json();
                console.log('IHA Bilgileri:', data);
                // Inputları doldur
                document.getElementById('brand').value = data.brand;
                document.getElementById('model').value = data.model;
                document.getElementById('weight').value = data.weight;
                document.getElementById('category').value = data.category;
            } else {
                // İsteğin başarısız olması durumunda hata mesajını logla
                console.error('IHA bilgilerini alma hatası:', response.statusText);
            }

        } catch (error) {
            // Ağ hatası durumunda hatayı logla
            console.error('Network hatası:', error);
        }
    } else {
        console.error('Access token bulunamadı.');
    }
}

//edithtml için fonksiyon
async function editIHA(ihaId) {
    const accessToken = getAccessToken();

    if (accessToken) {
        try {
            const newUrl = `editiha.html?id=${ihaId}`;
            window.location.href = newUrl;
        } catch (error) {
            console.error('Hata:', error);
        }
    } else {
        console.error('Access token bulunamadı.');
    }
}

//update işlemşi
async function updateIHA(ihaId, updatedData) {
    const accessToken = getAccessToken(); // Access token'ı buraya ekleyin

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/ihalar/${ihaId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            mode: 'cors',
            credentials: 'include',
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('IHA başarıyla güncellendi:', data);
            window.location.href = 'iha.html';
            // Gerekirse başarı durumunda ek işlemler yapabilirsiniz
        } else {
            console.error('IHA güncelleme hatası:', response.statusText);
            // Gerekirse hata durumunda ek işlemler yapabilirsiniz
        }
    } catch (error) {
        console.error('Network hatası:', error);
        // Gerekirse ağ hatası durumunda ek işlemler yapabilirsiniz
    }
}

async function rentIHAhtml(ihaId) {
    const accessToken = getAccessToken();

    if (accessToken) {
        try {
            const newUrl = `kirala.html?id=${ihaId}`;
            window.location.href = newUrl;
        } catch (error) {
            console.error('Hata:', error);
        }
    } else {
        console.error('Access token bulunamadı.');
    }
}

// IHA kiralama işlemi
async function rentIHA(ihaId, dateHourRanges) {
    const accessToken = getAccessToken();

    if (accessToken) {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/kiralamalar/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify({
                    iha_id: ihaId,
                    date_hour_ranges: dateHourRanges,
                }),
            });
            console.log("asf")
            const data = await response.json();

            if (response.ok) {
                console.log('IHA kiralama başarılı:', data);
                window.location.href = 'iha.html';
            } else {
                console.error('IHA kiralama hatası:', response.statusText);
            }
        } catch (error) {
            console.error('Network hatası:', error);
        }
    } else {
        console.error('Access token bulunamadı.');
    }
}

// user rent datatable
function userRentTableDraw(data) {
    console.log('Kiralama Kayıxxtları Data:', data);

    const table = $('#rentTable').DataTable({
        destroy: true, // DataTables'i yeniden başlat
        data: data, // Verileri tabloya ekle
        columns: [
            { data: 'id' },
            { data: 'date_hour_ranges' },
            { data: 'iha' },
            {
                data: null, render: function (data, type, row) {
                    return `
                    <button class="btn btn-danger" onclick="deleteRentById(${row.id})">Sil</button>
                    <button class="btn btn-info" onclick="editRent(${row.id})">Düzenle</button>`;

                }
            }
        ]
    });

    // DataTables'i yeniden çiz
    table.draw();
}

//userın kiraladıkları
async function getUserRents() {
    const accessToken = getAccessToken(); // Access token'ı al

    if (accessToken) {
        try {
            // Kullanıcının kiralama kayıtlarını getiren GET isteği
            const response = await fetch('http://127.0.0.1:8000/api/kiralamalar/user_rents/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                mode: 'cors',
                credentials: 'include',
            });

            // İsteğin başarılı olup olmadığını kontrol et
            if (response.ok) {
                // JSON verisini al ve kullan
                const data = await response.json();
                console.log('Kiralama Kayıtları:', data);
                userRentTableDraw(data);
            } else {
                // İsteğin başarısız olması durumunda hata mesajını logla
                console.error('Kiralama kayıtları alma hatası:', response.statusText);
            }

        } catch (error) {
            // Ağ hatası durumunda hatayı logla
            console.error('Network hatası:', error);
        }
    } else {
        console.error('Access token bulunamadı.');
    }
}

function allRentTableDraw(data) {
    console.log('Kiralama Kayıxxtları Data:', data);

    const table = $('#rentTable').DataTable({
        destroy: true, // DataTables'i yeniden başlat
        data: data, // Verileri tabloya ekle
        columns: [
            { data: 'id' },
            { data: 'date_hour_ranges' },
            { data: 'iha' },
            { data: 'renting_member' },
            {
                data: null, render: function (data, type, row) {
                    return `
                    <button class="btn btn-danger" onclick="deleteRentById(${row.id})">Sil</button>
                    <button class="btn btn-info" onclick="editRent(${row.id})">Düzenle</button>`;

                }
            }
        ]
    });

    // DataTables'i yeniden çiz
    table.draw();
}
// Tüm kiralama kayıtlarını listeleyen fonksiyon
async function getAllRents() {
    const accessToken = getAccessToken();

    if (accessToken) {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/kiralamalar/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                mode: 'cors',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Tüm Kiralama Kayıtları:', data);
                allRentTableDraw(data);
                // İlgili HTML elementine kiralama kayıtlarını ekleme veya gösterme
            } else {
                console.error('Kiralama kayıtları alma hatası:', response.statusText);
            }
        } catch (error) {
            console.error('Network hatası:', error);
        }
    } else {
        console.error('Access token bulunamadı.');
    }
}

// Kiralama kaydını ID ile silen fonksiyon
async function deleteRentById(rentId) {
    const accessToken = getAccessToken();

    if (accessToken) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/kiralamalar/${rentId}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                mode: 'cors',
                credentials: 'include',
            });

            if (response.ok) {
                console.log('Kiralama kaydı silindi.');
                location.reload();
            } else {
                console.error('Kiralama kaydı silme hatası:', response.statusText);
            }
        } catch (error) {
            console.error('Network hatası:', error);
        }
    } else {
        console.error('Access token bulunamadı.');
    }
}

// Kiralama kaydını ID ile düzenleyen fonksiyon
async function editRentById(rentId, updatedData) {
    const accessToken = getAccessToken();

    if (accessToken) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/kiralamalar/${rentId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                console.log('Kiralama kaydı güncellendi.');
                window.location.href = 'kiralamakayitlar.html';
            } else {
                console.error('Kiralama kaydı güncelleme hatası:', response.statusText);
            }
        } catch (error) {
            console.error('Network hatası:', error);
        }
    } else {
        console.error('Access token bulunamadı.');
    }
}

// İsteği yapmak için bir fonksiyon
async function getRentInfoById(id) {
    const accessToken = getAccessToken();

    if (accessToken) {
        try {
            // HTTP GET isteği
            const response = await fetch(`http://127.0.0.1:8000/api/kiralamalar/${id}/get_rent_info_by_id/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                mode: 'cors',
                credentials: 'include',
            });

            // İsteğin başarılı olup olmadığını kontrol et
            if (response.ok) {
                // JSON verisini al ve kullan
                const data = await response.json();
                console.log('Rent Info:', data);
                document.getElementById('dateHourRanges').value = data.date_hour_ranges;
            } else {
                // İsteğin başarısız olması durumunda hata mesajını logla
                console.error('Rent Info alma hatası:', response.statusText);
            }

        } catch (error) {
            // Ağ hatası durumunda hatayı logla
            console.error('Network hatası:', error);
        }
    } else {
        console.error('Access token bulunamadı.');
    }
}

//editRent için fonksiyon
async function editRent(rentId) {
    const accessToken = getAccessToken();

    if (accessToken) {
        try {
            const newUrl = `editkiralama.html?id=${rentId}`;
            window.location.href = newUrl;
        } catch (error) {
            console.error('Hata:', error);
        }
    } else {
        console.error('Access token bulunamadı.');
    }
}
