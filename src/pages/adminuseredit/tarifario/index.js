import React, { useState, useEffect } from 'react';
import {
    Input,
    Button,
    RadioGroup,
    Textarea,
    Accordion,
    AccordionSection,
} from 'react-rainbow-components';
import formatMoney from 'accounting-js/lib/formatMoney.js';
import FileSelector from '../../../components/react-rainbow-beta/components/FileSelector';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { useFirebaseApp, useUser } from 'reactfire';

const StyledSection = styled(AccordionSection)`
    color: black;

    & section > div:first-child,
    .rainbow-flex.header-divider {
        border: 1px solid gainsboro;
        background: gainsboro;
    }

    & section > div:first-child h3,
    .rainbow-flex.header-divider h3 {
        font-size: 1rem;
        font-weight: bold;
        margin-bottom: 0;
    }

    & section > div:first-child + div {
        padding: 0;
    }

    & .rainbow-flex {
        border: 1px solid gainsboro;
        background: white;
    }

    & .rainbow-flex > div,
    .rainbow-flex.header-divider h3 {
        flex: 1 1;
        padding: 1rem 2rem;
    }
    & .rainbow-flex > div.actions {
        flex: 1 1;
        text-align: right;

        button {
            border: 0;
            background: none;
        }
    }
`;

const InlineInput = styled(Input)`
    display: inline-flex;
    width: 70px;
    position: relative;
    top: -25px;
`;

const ErrorText = styled.div`
    flex: 1 1 100% !important;
    font-size: 0.7rem;
    color: red;
    text-align: left !important;
    margin-top: -36px;
    margin-bottom: 1rem;
`;

function TarifarioPorServicio({ label, tarifas, kgExtra, user, entrega }) {
    const firebase = useFirebaseApp();
    const db = firebase.firestore();
    const userFirebase = useUser();

    const [minRate, setMinRate] = useState();
    const [maxRate, setMaxRate] = useState();
    const [cost, setCost] = useState();

    const editRate = () => {
        console.log('No aparecen los datos', tarifas.min);
    };
    let tarifasMap = tarifas.map((tarifa, idx) => {
        let key = label + idx;
        return (
            <div className="rainbow-flex rainbow-flex_row rainbow-flex_wrap" key={key}>
                <div>
                    De {tarifa.min} Hasta {tarifa.max} kg
                </div>
                <div>{formatMoney(tarifa.precio)}</div>
                <div className="actions">
                    <button>
                        <FontAwesomeIcon icon={faPencilAlt} onClick={editRate} />
                    </button>
                    <button>
                        <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                </div>
            </div>
        );
    });

    const addRate = () => {
        const addRateData = {
            min: minRate,
            max: maxRate,
            entrega,
            precio: cost,
        };
        db.collection('profiles')
            .doc(user.id)
            .collection('rate')
            .add(addRateData)
            .then(function(docRef) {
                console.log('Document written with ID (origen): ', docRef.id);
            })
            .catch(function(error) {
                console.error('Error adding document: ', error);
            });
    };

    return (
        <StyledSection label={label}>
            {tarifasMap}
            <div className="rainbow-flex rainbow-flex_row rainbow-flex_wrap">
                <div>
                    De <InlineInput type="text" onChange={ev => setMinRate(ev.target.value)} />
                    Hasta
                    <InlineInput type="text" onChange={ev => setMaxRate(ev.target.value)} />
                    kg
                </div>
                <div>
                    <InlineInput type="text" onChange={ev => setCost(ev.target.value)} />
                </div>
                <div className="actions">
                    <Button label="Confirmar" onClick={addRate} />
                </div>
                <ErrorText>
                    Error: Los kilogramos que tienes deben estar duplicados o no ser consecutivos,
                    favor de revisar
                </ErrorText>
            </div>
            <div className="rainbow-flex rainbow-flex_row rainbow-flex_wrap header-divider">
                <h3>Kg Adicional</h3>
            </div>
            <div className="rainbow-flex rainbow-flex_row rainbow-flex_wrap">
                <div>{label}</div>
                <div>{formatMoney(kgExtra)}</div>
                <div className="actions">
                    <button>
                        <FontAwesomeIcon icon={faPencilAlt} />
                    </button>
                </div>
            </div>
        </StyledSection>
    );
}

export default function Tarifario({ user }) {
    useEffect(() => {}, [user]);
    const firebase = useFirebaseApp();
    const db = firebase.firestore();
    const userFirebase = useUser();

    const [tarifas, setTarifas] = useState([]);

    useEffect(() => {
        if (user) {
            const reloadTarifas = () => {
                db.collection('profiles')
                    .doc(user.id)
                    .collection('rate')
                    .onSnapshot(handleTarifas);
            };
            reloadTarifas();
        }
    }, []);

    function handleTarifas(snapshot) {
        const tarifas = snapshot.docs.map(doc => {
            return {
                id: doc.id,
                ...doc.data(),
            };
        });
        setTarifas(tarifas);
    }

    const estafetaDiaSiguiente = tarifas
        .filter(entregaFilter => {
            return entregaFilter.entrega === 'estafetaDiaSiguiente';
        })
        .map((entrega, xid) => {
            return { max: entrega.max, precio: entrega.precio, min: entrega.min };
        });

    const estafetaEconomico = tarifas
        .filter(entregaFilter => {
            return entregaFilter.entrega === 'estafetaEconómico';
        })
        .map((entrega, xid) => {
            return { max: entrega.max, precio: entrega.precio, min: entrega.min };
        });

    const fedexDiaSiguiente = tarifas
        .filter(entregaFilter => {
            return entregaFilter.entrega === 'fedexDiaSiguiente';
        })
        .map((entrega, xid) => {
            return { max: entrega.max, precio: entrega.precio, min: entrega.min };
        });

    const fedexEconomico = tarifas
        .filter(entregaFilter => {
            return entregaFilter.entrega === 'fedexEconomico';
        })
        .map((entrega, xid) => {
            return { max: entrega.max, precio: entrega.precio, min: entrega.min };
        });

    return (
        <>
            <h2>Tarifario del cliente</h2>
            <h3 style={{ marginTop: '1rem' }}>Estafeta</h3>
            <Accordion id="accordion-estafeta" multiple={true}>
                <TarifarioPorServicio
                    label="Estafeta Día Siguiente"
                    tarifas={estafetaDiaSiguiente}
                    kgExtra="250"
                    user={user}
                    entrega="estafetaDiaSiguiente"
                />

                <TarifarioPorServicio
                    label="Estafeta Terrestre"
                    tarifas={estafetaEconomico}
                    kgExtra="150"
                    user={user}
                    entrega="estafetaEconómico"
                />
            </Accordion>
            <h3 style={{ marginTop: '1rem' }}>Fedex</h3>
            <Accordion id="accordion-fedex" multiple={true}>
                <TarifarioPorServicio
                    label="Fedex Día Siguiente"
                    tarifas={fedexDiaSiguiente}
                    kgExtra="250"
                    user={user}
                    entrega="fedexDiaSiguiente"
                />
                <TarifarioPorServicio
                    label="Fedex Terrestre"
                    tarifas={fedexEconomico}
                    kgExtra="150"
                    user={user}
                    entrega="fedexEconomico"
                />
            </Accordion>
            <p style={{ margin: '1rem' }}>
                <b>NOTA:</b> El peso volumétrico equivale al (largo x ancho x alto) / 5000 y este
                número siempre es un entero que se redondea hacia arriba, esa equivalencia se tomará
                para los kg.
            </p>
        </>
    );
}
