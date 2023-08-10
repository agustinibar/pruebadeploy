import './App.css';
import {Auth} from './components/auth'
import  {db, auth, storage} from '../src/config/firebase'
import { useEffect, useState } from 'react';
import {getDocs, collection, addDoc, updateDoc, doc} from 'firebase/firestore';
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
import {v4} from 'uuid'
import React from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';


function App() {
   // CONFIGURACION DEL PAGO=======================================
   const[preferenceId, setPreferenceId] = useState(null);
   initMercadoPago("TEST-b1609369-11aa-4417-ac56-d07ef28cfcff");
   
     const createPreference = async()=>{
         try {
             const response = await axios.post(`http://localhost:3001/createorder`, {
                 description: `anda el deploy con mercado libre`,
                 price: 80,
                 quantity: 1,
                 currency_id: "ARS",
             });
 
             const { id } = response.data;
 
             return id
         } catch (error) {
             console.log(error)
         }
     }
     const handleBuy = async()=>{
         const id = await createPreference();
         if (id){
             setPreferenceId(id)
         }
     }
  //obtener las propiedades en un array:
  const [propertiesList, setPropertiesList] = useState([]);
  //crear propiedades en el firestore:
  const [newPropName, setNewPropName] = useState("");
  const [newPropRooms, setNewPropRooms] = useState(0);
  const [newPropDisponible, setNewPropDisponible] = useState(false);
  const [newPropType, setNewPropType] = useState([]);
  //actualizar nombre:
  const [updateNameProp, setUpdateNameProp] = useState("")
  // manejar imagenes:
  const [file, setFile] = useState(null);
  const [image, setImage] = useState([]);

  //rutas de informacion:
  const propertiesCollectionRef= collection(db, "properties"); 
  const imageUrlRef = ref(storage, 'properties/')

  //funcion para crear propiedades
  const onSubmitProp = async () => {
    try {
      // subimos la imagen al storage y obtenemos su url
      if (file) {
        const folderRef = ref(storage, `properties/${file.name + v4()}`);
        await uploadBytes(folderRef, file);
        const imageUrl = await getDownloadURL(folderRef);

        // creamos la propiedad y le agregamos la propiedad imageUrl
        await addDoc(propertiesCollectionRef, {
          name: newPropName,
          rooms: newPropRooms,
          disponible: newPropDisponible,
          location: newPropType,
          userId: auth?.currentUser?.uid,
          imageUrl: imageUrl // <====|| ACA TA LA URL
        });
      } else {
        // por ahora, si no hay img se crea igual, pero podriamos agregarle una por defecto
        await addDoc(propertiesCollectionRef, {
          name: newPropName,
          rooms: newPropRooms,
          disponible: newPropDisponible,
          location: newPropType,
          userId: auth?.currentUser?.uid,
        });
      }

      // se limpia el estado 
      setNewPropName("");
      setNewPropRooms(0);
      setNewPropDisponible(false);
      setNewPropType([]);
      setFile(null);

      alert('Ahora si papu, alta app nos hicimos');
    } catch (error) {
      console.log(error)
    }
  };

    //funcion para actualizar propiedades
  const updateProperty = async(id)=>{
    try {
      const property = doc(db, 'properties', id);
      await updateDoc(property, {name: updateNameProp})
    } catch (error) {
      console.log(error)
    }
  };

  // funcion para cargar archivos
  // const uploadFile = async()=>{
  //   if(!file) return;
  //   const folderRef = ref(storage, `properties/${file.name + v4()}`);
  //   try {
  //     await uploadBytes(folderRef, file)
  //     console.log(folderRef)
  //     alert('la imagen fue enviada a la base de datos')
  //   } catch (error) {
  //     console.log(error)
  //   }
  // };


  //cargamos las propeidades cada vez que se monte el componente
  useEffect(()=>{
    //funcion para traernos las propiedades
    const getPropertiesList = async () => {
      try {
        const data = await getDocs(propertiesCollectionRef);
        const filterData = await Promise.all(
          data.docs.map(async (doc) => {
            const propertyData = doc.data();
            // si encontramos url de la imagen, la buscamos en el storage y la agregamos al propertyData
            if (propertyData.imageUrl) {
              const imageUrlRef = ref(storage, propertyData.imageUrl);
              propertyData.imageUrl = await getDownloadURL(imageUrlRef);
            }
            return {
              ...propertyData,
              id: doc.id
            };
          })
        );
        console.log(filterData);
        setPropertiesList(filterData);
      } catch (error) {
        console.log(error);
      }
    };
    // funcion para traer imagenes en gral
    // listAll(imageUrlRef).then((response) => {
    //   const urls = [];
    //   response.items.forEach((item) => {
    //     getDownloadURL(item).then((url) => {
    //       urls.push(url);
    //       setImage(urls); 
    //     })
    //   })
    // })
    getPropertiesList();
  }, []);

  return (
    <div className="App">
      <h1>AUTHENTICATION</h1>
      <Auth/>
      <div>
        <h1>PRUEBA RENDERIZADO DE CARD</h1>
        {propertiesList.map((p)=>(
          <div>
            <h1 style={{color:p.disponible ? "green" : "red"}}>{p.name}</h1>
            <p>Habitaciones:{p.rooms}</p>
            <p>Tipo: {p.location}</p>
            <img src={p.imageUrl}/>
            <input placeholder='new name...' onChange={(e)=> setUpdateNameProp(e.target.value)}></input>
            <button onClick={()=>updateProperty(p.id)}>Actualizar Nombre</button>
          </div>
        ))} 
        
      </div>
      <div>
        <h1>PRUEBA DE POST</h1>
        <input placeholder='name...' onChange={(e)=>setNewPropName(e.target.value)}></input>
        <input placeholder='rooms...' type='number ' onChange={(e)=>setNewPropRooms(Number(e.target.value))}></input>
        <select value={newPropType} onChange={(e) => setNewPropType(e.target.value)}>
        <option value="">Seleccionar tipo</option>
        <option value="cabanita">Cabanita</option>
        <option value="lujosa">Lujosa</option>
      </select>
        <input type='checkbox' checked={newPropDisponible} onChange={(e)=> setNewPropDisponible(e.target.checked)}></input>
        <label>Disponible</label>
        <button onClick={onSubmitProp}>Crear Propiedad</button>
      </div>
      <div>
        <input type='file' onChange={(e)=> setFile(e.target.files[0])}></input>
      </div>
      <br></br>
      <button onClick={handleBuy}>Reserve</button>
      {preferenceId && <Wallet initialization={{ preferenceId: preferenceId}} />}
    </div>
  );
}

export default App;
