import React, { useState, useEffect } from 'react';
import { Input, CheckboxToggle, Button, Picklist, Option } from 'react-rainbow-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { StyledLeftPane, StyledRightPane, StyledPaneContainer, StyledRadioGroup } from './styled';
import * as firebase from 'firebase';
import { useFirebaseApp, useUser } from 'reactfire';

const StatePicklistOptions = () => {
    return (
        <>
            <Option value="AG" name="Aguascalientes" label="Aguascalientes" />
            <Option value="BC" name="Baja California" label="Baja California" />
            <Option value="BS" name="Baja California Sur" label="Baja California Sur" />
            <Option value="CM" name="Campeche" label="Campeche" />
            <Option value="CS" name="Chiapas" label="Chiapas" />
            <Option value="CH" name="Chihuahua" label="Chihuahua" />
            <Option value="CO" name="Coahuila" label="Coahuila" />
            <Option value="CL" name="Colima" label="Colima" />
            <Option value="DF" name="Ciudad de México" label="Ciudad de México" />
            <Option value="DG" name="Durango" label="Durango" />
            <Option value="GT" name="Guanajuato" label="Guanajuato" />
            <Option value="GR" name="Guerrero" label="Guerrero" />
            <Option value="HG" name="Hidalgo" label="Hidalgo" />
            <Option value="JA" name="Jalisco" label="Jalisco" />
            <Option value="EM" name="Estado de México" label="Estado de México" />
            <Option value="MI" name="Michoacán" label="Michoacán" />
            <Option value="MO" name="Morelos" label="Morelos" />
            <Option value="NA" name="Nayarit" label="Nayarit" />
            <Option value="NL" name="Nuevo León" label="Nuevo León" />
            <Option value="OA" name="Oaxaca" label="Oaxaca" />
            <Option value="PU" name="Puebla" label="Puebla" />
            <Option value="QE" name="Querétaro" label="Querétaro" />
            <Option value="QR" name="Quintana Roo" label="Quintana Roo" />
            <Option value="SL" name="San Luis Potosí" label="San Luis Potosí" />
            <Option value="SI" name="Sinaloa" label="Sinaloa" />
            <Option value="SO" name="Sonora" label="Sonora" />
            <Option value="TB" name="Tabasco" label="Tabasco" />
            <Option value="TM" name="Tamaulipas" label="Tamaulipas" />
            <Option value="TL" name="Tlaxcala" label="Tlaxcala" />
            <Option value="VE" name="Veracruz" label="Veracruz" />
            <Option value="YU" name="Yucatán" label="Yucatán" />
            <Option value="ZA" name="Zacatecas" label="Zacatecas" />
        </>
    );
};

const AddressRadioOption = ({ directions }) => {
    const {
        neighborhood,
        place_reference,
        phone,
        street_number,
        country,
        state,
        codigo_postal,
        name,
    } = directions;

    return (
        <>
            <span>
                <b>{name}</b>
            </span>
            <p>{street_number}</p>
            <p>{neighborhood}</p>
            <p>
                {country}, {state}
            </p>
            <p>C.P. {codigo_postal}</p>
            <p>Tel {phone}</p>
        </>
    );
};

export const DestinoComponent = ({ onSave }) => {
    const [value, setValue] = useState(null);
    const [directionDataa, setDirectionDataa] = useState([]);

    const firebase = useFirebaseApp();
    const db = firebase.firestore();
    const user = useUser();

    const [error, setError] = useState(false);
    const [filter, setFilter] = useState('');

    const [name, setName] = useState('');
    const [CP, setCP] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [country, setCountry] = useState('');
    const [state, setState] = useState('');
    const [streetNumber, setStreetNumber] = useState('');
    const [placeRef, setPlaceRef] = useState('');
    const [phone, setPhone] = useState('');

    const [checkBox, setCheckBox] = useState(true);

    const creationDate = new Date();

    useEffect(() => {
        const reloadDirectios = () => {
            db.collection('receiver_addresses')
                .where('ID', '==', user.uid)
                .onSnapshot(handleDirections);
        };
        reloadDirectios();
    }, []);

    function handleDirections(snapshot) {
        const directionDataa = snapshot.docs.map(doc => {
            return {
                id: doc.id,
                ...doc.data(),
            };
        });
        setDirectionDataa(directionDataa);
    }

    const options = directionDataa
        .filter(directions => {
            if (filter === null) {
                return directions;
            } else if (
                directions.name.includes(filter) ||
                directions.street_number.includes(filter)
            ) {
                return directions;
            }
        })
        .map(directions => {
            return {
                value: directions.id + '',
                label: <AddressRadioOption key={directions.id} directions={directions} />,
            };
        });
    console.log(filter);

    const search = e => {
        let keyword = e.target.value;
        setFilter(keyword);
    };

    useEffect(() => {
        if (value) {
            const docRef = db.collection('receiver_addresses').doc(value);
            docRef
                .get()
                .then(function(doc) {
                    if (doc.exists) {
                        setName(doc.data().name);
                        setCP(doc.data().codigo_postal);
                        setNeighborhood(doc.data().neighborhood);
                        setCountry(doc.data().country);
                        setState({ value: doc.data().state });
                        setStreetNumber(doc.data().street_number);
                        setPlaceRef(doc.data().place_reference);
                        setPhone(doc.data().phone);
                        setCheckBox(false);
                    } else {
                        console.log('No such document!');
                    }
                })
                .catch(function(error) {
                    console.log('Error getting document:', error);
                });
        }
    }, [value]);

    const registerDirecction = () => {
        if (
            name.trim() === '' ||
            CP.trim() === '' ||
            neighborhood.trim() === '' ||
            country.trim() === '' ||
            state.value.trim() === '' ||
            streetNumber.trim() === '' ||
            placeRef.trim() === '' ||
            phone.trim() === ''
        ) {
            setError(true);
            return;
        }

        const directionData = {
            name,
            codigo_postal: CP,
            neighborhood,
            country,
            state: state.value,
            street_number: streetNumber,
            place_reference: placeRef,
            phone,
            ID: user.uid,
            creation_date: creationDate.toLocaleDateString(),
        };

        const directionGuiaData = {
            receiver_addresses: {
                name,
                codigo_postal: CP,
                neighborhood,
                country,
                state: state.value,
                street_number: streetNumber,
                place_reference: placeRef,
                phone,
                ID: user.uid,
                creation_date: creationDate.toLocaleDateString(),
            },
        };
        const duplicateName = directionDataa.map((searchName, idx) => {
            return searchName.name;
        });

        onSave(directionData, directionGuiaData, checkBox, duplicateName, name);
    };

    return (
        <StyledPaneContainer>
            <StyledLeftPane>
                <h4>Mis direcciones</h4>
                <Input
                    value={filter}
                    placeholder="Buscar"
                    iconPosition="right"
                    icon={<FontAwesomeIcon icon={faSearch} />}
                    onChange={e => search(e)}
                />
                <StyledRadioGroup
                    id="radio-group-component-1"
                    options={options}
                    value={value}
                    className="rainbow-m-around_small"
                    onChange={e => setValue(e.target.value)}
                />
            </StyledLeftPane>
            <StyledRightPane>
                <h4>Dirección de Destino</h4>
                <div className="rainbow-align-content_center rainbow-flex_wrap">
                    <Input
                        id="nombre"
                        label="Nombre"
                        name="nombre"
                        value={name}
                        className="rainbow-p-around_medium"
                        style={{ width: '70%' }}
                        onChange={e => setName(e.target.value)}
                    />
                    <Input
                        id="cp"
                        label="C.P."
                        name="cp"
                        value={CP}
                        className="rainbow-p-around_medium"
                        style={{ width: '30%' }}
                        onChange={e => setCP(e.target.value)}
                    />
                </div>
                <div className="rainbow-align-content_center rainbow-flex_wrap">
                    <Input
                        id="domicilio"
                        label="Calle y Número"
                        name="domicilio"
                        value={streetNumber}
                        className="rainbow-p-around_medium"
                        style={{ flex: '1 1' }}
                        onChange={e => setStreetNumber(e.target.value)}
                    />
                    <Input
                        id="colonia"
                        label="Colonia"
                        name="colonia"
                        value={neighborhood}
                        className="rainbow-p-around_medium"
                        style={{ flex: '1 1' }}
                        onChange={e => setNeighborhood(e.target.value)}
                    />
                </div>
                <div className="rainbow-align-content_center rainbow-flex_wrap">
                    <Input
                        id="ciudad"
                        label="Ciudad"
                        name="ciudad"
                        value={country}
                        className="rainbow-p-around_medium"
                        style={{ flex: '1 1' }}
                        onChange={e => setCountry(e.target.value)}
                    />
                    <Picklist
                        id="estado"
                        label="Estado"
                        name="estado"
                        value={state}
                        className="rainbow-p-around_medium"
                        style={{ flex: '1 1' }}
                        onChange={value => setState(value)}
                        required
                    >
                        <StatePicklistOptions />
                    </Picklist>
                </div>
                <div className="rainbow-align-content_center rainbow-flex_wrap">
                    <Input
                        id="referencia"
                        label="Referencias del Lugar"
                        name="referencia"
                        value={placeRef}
                        className="rainbow-p-around_medium"
                        style={{ flex: '2 2' }}
                        onChange={e => setPlaceRef(e.target.value)}
                    />
                    <Input
                        id="telefono"
                        label="Telefono"
                        name="telefono"
                        value={phone}
                        className="rainbow-p-around_medium"
                        style={{ flex: '2 2' }}
                        onChange={e => setPhone(e.target.value)}
                    />
                    <div style={{ flex: '1 1', textAlign: 'right' }}>
                        <CheckboxToggle
                            id="guardar"
                            label="Guardar"
                            value={checkBox}
                            onChange={e => setCheckBox(e.target.checked)}
                        />
                    </div>
                </div>
                {error && (
                    <div className="alert-error">Todos los campos necesitan estar llenos</div>
                )}
                <Button
                    variant="brand"
                    className="rainbow-m-around_medium"
                    onClick={registerDirecction}
                >
                    Continuar
                    <FontAwesomeIcon icon={faArrowRight} className="rainbow-m-left_medium" />
                </Button>
            </StyledRightPane>
        </StyledPaneContainer>
    );
};
