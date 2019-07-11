// import
importScripts('js/sw-utils.js');

const CACHE_STATIC_NAME  = 'static-v2';
const CACHE_DYNAMIC_NAME = 'dynamic-v2';
const CACHE_INMUTABLE_NAME = 'inmutable-v1';

const CACHE_DYNAMIC_LIMIT = 50;
// el corazon de la aplicacion. lo que deberia estar cargado lo mas rapido posible
const APP_SHELL = [
    // '/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js'
];

// Todo lo que no se va a modificar.
const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js'
];

self.addEventListener('install', e => {

    const cacheStatic = caches.open( CACHE_STATIC_NAME )
        .then( cache => cache.addAll( APP_SHELL ));

    const cacheInmutable = caches.open( CACHE_INMUTABLE_NAME )
        .then( cache => cache.addAll( APP_SHELL_INMUTABLE ));


    e.waitUntil( Promise.all([cacheStatic, cacheInmutable]) );

});


self.addEventListener('activate', e => {
    // Borrar los caches que ya no me sirven
    const resupuesta = caches.keys().then( keys => {
        keys.forEach( key => {

            if ( key !== CACHE_STATIC_NAME && key.includes('static') ) {
                return caches.delete(key);
            }
           
            if ( key !== CACHE_DYNAMIC_NAME && key.includes('dynamic') ) {
                return caches.delete(key);
            }
        });
    })
    e.waitUntil(resupuesta);
});

self.addEventListener('fetch', e =>{

    // 2- Cache with Network Fallback
    const respuesta = caches.match( e.request )
        .then( res => {
            // si existe trae todo y termina ahi.
            if ( res ) return res;

            // No existe el archivo
            // tengo que ir a la web
            return fetch( e.request ).then( newResp => {
                
                return actualizarCacheDinamico( CACHE_DYNAMIC_NAME, e.request, newResp);

            })
            .catch( err => {
                console.log('ingreso');
                //no tengo concexion de intenert
                // Detectamos si es un sistio web
                if ( e.request.headers.get('accept').includes('text/html') ) {
                    return caches.match('pages/offline.html');
                }
            });


        });

    e.respondWith( respuesta );
});