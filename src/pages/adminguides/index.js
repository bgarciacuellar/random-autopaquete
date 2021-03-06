import React, { useState, useEffect, useRef } from 'react';
import {
    Column,
    DatePicker,
    TableWithBrowserPagination,
    Select,
    Spinner,
    Input,
    Button,
} from 'react-rainbow-components';
import styled from 'styled-components';
import { Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { useFirebaseApp } from 'reactfire';
import { StyledAusers } from '../adminusers/styled';
import ExportReactCSV from '../dowloadData/index';
import swal from 'sweetalert2';
import { connectScrollTo } from 'react-instantsearch-dom';

const StyledTable = styled(TableWithBrowserPagination)`
    td[data-label='Guía'] {
        > div {
            line-height: 1.2rem;
            > span {
                white-space: break-spaces;
                font-size: 12px;
            }
        }
    }
`;

const DownloadLabel = ({ value }) => {
    const [label, setLabel] = useState(true);
    useEffect(() => {
        //console.log('value', value);
        if (value === 'no disponible') {
            setLabel(false);
        } else {
            setLabel(true);
        }
    }, []);
    return (
        <>
            {label ? (
                <a
                    download="guia"
                    href={`data:application/pdf;base64,${value}`}
                    title="Descargar etiqueta"
                    variant="neutral"
                    className="rainbow-m-around_medium"
                >
                    <FontAwesomeIcon icon={faDownload} className="rainbow-medium" />
                </a>
            ) : (
                <p className="rainbow-m-around_medium">N/D</p>
            )}
        </>
    );
};

function Destinations(value) {
    return (
        <div style={{ lineHeight: '30px' }}>
            <span style={{ whiteSpace: 'initial' }}>{value.row.Destination}</span>
        </div>
    );
}

function Origins(value) {
    return (
        <div style={{ lineHeight: '30px' }}>
            <span style={{ whiteSpace: 'initial' }}>{value.row.origin}</span>
        </div>
    );
}

export default function AllGuides({}) {
    const firebase = useFirebaseApp();
    const db = firebase.firestore();
    const [history, setHistory] = useState([]);
    const [allGuides, setAllGuides] = useState([]);
    const [usersName, setUsersName] = useState([]);
    const [tableData, setTableData] = useState();
    const [tableUsers, setTableUsers] = useState();
    const [selectName, setSelectName] = useState();
    const [selectSupplier, setSelectSupplier] = useState();
    const [selectDate, setSelectDate] = useState({ date: new Date() });
    const [startDate, setStartDate] = useState({ date: new Date() });
    const [endDate, setEndDate] = useState({ date: new Date() });
    const [displayData, setDisplayData] = useState(false);
    const [available, setAvailable] = useState(false);
    const [dateListItem, setDateListItem] = useState();
    const [searchPeriod, setSearchPeriod] = useState(false);
    const [searchTracking, setSearchTracking] = useState(true);
    const [searchUser, setSearchUser] = useState(true);
    const [searchService, setSearchService] = useState(true);
    const nameSelected = useRef('usuario');
    const supplierSelected = useRef('servicio');
    const dateFrom = useRef('');
    const dateTo = useRef('');
    const dateSelected = useRef({ date: new Date() });
    let allSuppliers = [
        {
            value: 'servicio',
            label: 'servicio',
        },
        {
            value: 'fedexEconomico',
            label: 'Fedex Economico',
        },
        {
            value: 'fedexDiaSiguiente',
            label: 'Fedex Dia Siguiente',
        },
        {
            value: 'estafetaEconomico',
            label: 'Estafeta Economico',
        },
        {
            value: 'estafetaDiaSiguiente',
            label: 'Estafeta Dia Siguiente',
        },
        {
            value: 'redpackExpress',
            label: 'Redpack Express',
        },
        {
            value: 'redpackEcoExpress',
            label: 'Redpack Eco Express',
        },
        {
            value: 'autoencargosEconomico',
            label: 'Autoencargos',
        },
    ];
    const typeSearch = [
        {
            value: 'periodo',
            label: 'Periodo',
        },
        {
            value: 'guia',
            label: 'Guia',
        },
    ];
    const optionsDate = { year: '2-digit', month: '2-digit', day: '2-digit' };

    //Get the first 100 guides, show only for today
    useEffect(() => {
        let dataGuias = [];
        let guiasByDate = [];
        let convertDate = new Date().toLocaleDateString('es-US', optionsDate);
        db.collection('guia')
            .where('status', '==', 'completed')
            .orderBy('creation_date', 'desc')
            .limit(100)
            .get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    dataGuias.push({
                        id: doc.id,
                        volumetricWeight: Math.ceil(
                            (doc.data().package.height *
                                doc.data().package.width *
                                doc.data().package.depth) /
                                5000,
                        ),
                        sentDate: doc
                            .data()
                            .creation_date.toDate()
                            .toLocaleDateString('es-US', optionsDate),
                        ...doc.data(),
                    });
                });

                guiasByDate = dataGuias.filter(item => item.sentDate.includes(convertDate));
                setHistory(guiasByDate);
                console.log('inabilitando funciones');
                //allGuidesEver();
                //setDisplayData(true);
                searchName();
            })
            .catch(function(error) {
                console.log('Error getting documents: ', error);
            });
    }, []);

    //Get all the guides, all the times
    const allGuidesEver = () => {
        let dataALLGuias = [];
        db.collection('guia')
            .where('status', '==', 'completed')
            .orderBy('creation_date', 'desc')
            .get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    dataALLGuias.push({
                        id: doc.id,
                        volumetricWeight: Math.ceil(
                            (doc.data().package.height *
                                doc.data().package.width *
                                doc.data().package.depth) /
                                5000,
                        ),
                        sentDate: doc
                            .data()
                            .creation_date.toDate()
                            .toLocaleDateString('es-US', optionsDate),
                        ...doc.data(),
                    });
                });
                console.log(dataALLGuias);
                setAllGuides(dataALLGuias);
                setAvailable(true);
            })
            .catch(function(error) {
                console.log('Error getting documents: ', error);
            });
    };

    const searchName = () => {
        let dataUsers = [];
        let dataSingleUser = [];
        db.collection('profiles')
            // .where('status', '==', 'completed')
            // .orderBy('creation_date', 'desc')
            .get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    //console.log(doc.data().name, doc.data().lastname);
                    dataUsers.push({
                        fullname: doc.data().name + ' ' + doc.data().lastname,
                        name: doc.data().name,
                    });
                });
                console.log(dataUsers);
                dataSingleUser = dataUsers
                    .filter((item, index) => dataUsers.indexOf(item) === index)
                    //.sort();
                    .sort((a, b) => a.fullname.localeCompare(b.fullname));
                console.log(dataSingleUser);
                setUsersName(dataSingleUser);
            });
    };

    useEffect(() => {
        setTableData(
            history.map(historyRecord => {
                return {
                    id: historyRecord.id,
                    date: historyRecord.package.creation_date,
                    name: historyRecord.name,
                    guide: historyRecord.rastreo,
                    nameorigin: `${historyRecord.sender_addresses.name} , ${historyRecord.sender_addresses.phone}`,
                    origin: `${historyRecord.sender_addresses.street_name} , ${historyRecord.sender_addresses.street_number} , ${historyRecord.sender_addresses.neighborhood} , ${historyRecord.sender_addresses.country} , ${historyRecord.sender_addresses.codigo_postal}`,
                    namedestination: `${historyRecord.receiver_addresses.name} , ${historyRecord.receiver_addresses.phone}`,
                    Destination: `${historyRecord.receiver_addresses.street_name} , ${historyRecord.receiver_addresses.street_number} , ${historyRecord.receiver_addresses.neighborhood} , ${historyRecord.receiver_addresses.country} , ${historyRecord.receiver_addresses.codigo_postal}`,

                    service: historyRecord.supplierData.Supplier,
                    volumetricWeight: historyRecord.volumetricWeight,
                    weight: historyRecord.package.weight,
                    measurement: `${historyRecord.package.height} x ${historyRecord.package.width} x ${historyRecord.package.depth}`,
                    cost:
                        typeof historyRecord.rastreo != 'undefined'
                            ? historyRecord.supplierData.Supplier_cost
                            : '0.00',
                    label:
                        historyRecord.supplierData.Supplier === 'autoencargosEconomico'
                            ? 'no disponible'
                            : historyRecord.label,
                };
            }),
        );
        setDisplayData(true);
    }, [history]);

    useEffect(() => {
        let mapUsers = usersName.map(historyRecord => {
            //console.log(historyRecord);
            return {
                value: historyRecord.name,
                label: historyRecord.fullname,
            };
        });
        setTableUsers([{ value: 'usuario', label: 'usuario' }, ...mapUsers]);
        setDisplayData(true);
    }, [usersName]);

    const listBetweenDays = (startDate, endDate) => {
        var moment = require('moment');
        let desde = moment(startDate);
        let hasta = moment(endDate);
        let dates = [];

        console.log(startDate, endDate);

        while (desde.format('DD/MM/YY') !== hasta.format('DD/MM/YY')) {
            dates.push(desde.format('DD/MM/YY'));
            desde.add(1, 'days');
        }
        dates.push(hasta.format('DD/MM/YY'));
        dates = dates.reverse();

        return dates;
    };

    const searchByDate = (startDate, endDate) => {
        setDisplayData(false);
        console.log(startDate, endDate);
        // crear lista del periodo de dias
        let dates = listBetweenDays(startDate, endDate);
        let ByPeriod = [];
        //realizar consulta por cada dia de la lista
        dates.forEach(function(date, index, dates) {
            db.collection('guia')
                .where('status', '==', 'completed')
                .where('package.creation_date', '==', '' + date + '')
                .orderBy('creation_date', 'desc')
                .get()
                .then(function(querySnapshot) {
                    querySnapshot.forEach(function(doc) {
                        ByPeriod.push({
                            id: doc.id,
                            volumetricWeight: Math.ceil(
                                (doc.data().package.height *
                                    doc.data().package.width *
                                    doc.data().package.depth) /
                                    5000,
                            ),
                            ...doc.data(),
                        });
                    });
                    console.log(date);
                    setDateListItem('' + date + '');
                    // si es la ultima guia, de la ultima fecha, mostrar historial en pantalla
                    if (Object.is(dates.length - 1, index)) {
                        setHistory(ByPeriod);
                    }
                })
                .catch(function(error) {
                    console.log('Error getting documents: ', error);
                });
        });
        setDateListItem('');
    };

    const getIdGuia = trackingNumber => {
        // console.log(trackingNumber);
        let dataGuia = [];
        if (trackingNumber == '' || !trackingNumber) {
            swal.fire(
                '¡Oh no!',
                'Parece que no hay alguna guía con ese número, podrías revisar',
                'error',
            );
        } else {
            db.collection('guia')
                .where('rastreo', '==', trackingNumber)
                .get()
                .then(function(querySnapshot) {
                    querySnapshot.forEach(function(doc) {
                        console.log(doc.id);
                        dataGuia.push({
                            id: doc.id,
                            volumetricWeight: Math.ceil(
                                (doc.data().package.height *
                                    doc.data().package.width *
                                    doc.data().package.depth) /
                                    5000,
                            ),
                            ...doc.data(),
                        });
                        setHistory(dataGuia);
                        setDisplayData(true);
                    });
                })
                .catch(function(error) {
                    swal.fire(
                        '¡Oh no!',
                        'Parece que no hay alguna guía con ese número, podrías revisar',
                        'error',
                    );
                    console.log('Error getting documents: ', error);
                });
            db.collection('guia')
                .where('rastreo', 'array-contains', trackingNumber)
                .get()
                .then(function(querySnapshot) {
                    querySnapshot.forEach(function(doc) {
                        console.log(doc.id);
                        dataGuia.push({
                            id: doc.id,
                            volumetricWeight: Math.ceil(
                                (doc.data().package.height *
                                    doc.data().package.width *
                                    doc.data().package.depth) /
                                    5000,
                            ),
                            ...doc.data(),
                        });
                        setHistory(dataGuia);
                        setDisplayData(true);
                    });
                })
                .catch(function(error) {
                    swal.fire(
                        '¡Oh no!',
                        'Parece que no hay alguna guía con ese número, podrías revisar',
                        'error',
                    );
                    console.log('Error getting documents: ', error);
                });
        }
    };

    const changeSearch = search => {
        console.log(search);
        switch (search) {
            case 'periodo':
                setSearchPeriod(false);
                setSearchTracking(true);
                document.getElementById('input-2').value = '';
                break;
            case 'guia':
                setSearchPeriod(true);
                setSearchTracking(false);
                break;
        }
    };

    return (
        <StyledAusers>
            <div className="back">
                <Row className="content-header row-header">
                    <h1 id="header-margin">Historial de envíos</h1>
                    <div>
                        <ExportReactCSV data={history} />
                    </div>
                </Row>
                <Row>
                    <Col md="2">
                        <h2 style={{ marginBottom: 10 }}>Filtrar por :</h2>
                    </Col>
                    <Select
                        options={typeSearch}
                        onChange={search => changeSearch(search.target.value)}
                    />
                </Row>
                <Row className="content-header">
                    <Col md="3">
                        <Input
                            disabled={searchTracking}
                            id="guia"
                            placeholder="Numero de guia"
                            className="rainbow-p-around_medium"
                            style={{ flex: '1 1' }}
                            onChange={ev => getIdGuia(ev.target.value)}
                            icon={
                                <FontAwesomeIcon icon={faSearch} className="rainbow-color_gray-3" />
                            }
                        />
                    </Col>
                    <Col md="3">
                        <DatePicker
                            // formatStyle="medium"
                            disabled={searchPeriod}
                            value={startDate.date}
                            onChange={value => setStartDate({ date: value })}
                        />
                    </Col>
                    <Col md="3">
                        <DatePicker
                            // formatStyle="small"
                            disabled={searchPeriod}
                            value={endDate.date}
                            onChange={value => setEndDate({ date: value })}
                        />
                    </Col>
                    <div className="rainbow-align-content_center rainbow-flex_wrap">
                        <Button
                            disabled={searchPeriod}
                            //disabled={available ? false : true}
                            className="rainbow-m-around_medium"
                            onClick={() => searchByDate(startDate.date, endDate.date)}
                        >
                            Buscar
                        </Button>
                    </div>
                </Row>
                <div className="rainbow-p-bottom_xx-large">
                    {displayData ? (
                        <StyledTable
                            data={tableData}
                            pageSize={20}
                            keyField="id"
                            emptyTitle="Oh no!"
                            emptyDescription="No hay ningun registro actualmente..."
                            className="direction-table"
                        >
                            <Column header="Fecha " field="date" defaultWidth={105} />
                            <Column header="Name " field="name" defaultWidth={120} />
                            <Column header="Guía" field="guide" defaultWidth={120} />
                            <Column header="Nombre Origen" field="nameorigin" defaultWidth={100} />
                            <Column
                                header="Origen"
                                component={Origins}
                                field="origin"
                                style={{ lineHeight: 25 }}
                                // defaultWidth={125}
                            />
                            <Column
                                header="Nombre Destino"
                                field="namedestination"
                                defaultWidth={100}
                            />
                            <Column
                                header="Destino"
                                component={Destinations}
                                field="Destination"
                                style={{ lineHeight: 25 }}
                                // defaultWidth={125}
                            />
                            <Column header="Servicio" field="service" defaultWidth={105} />
                            <Column header="PF" field="weight" defaultWidth={70} />
                            <Column header="PV" field="volumetricWeight" defaultWidth={70} />
                            <Column header="Medidas (cm)" field="measurement" defaultWidth={115} />
                            <Column header="Costo" field="cost" defaultWidth={75} />
                            <Column
                                header="Etiqueta"
                                component={DownloadLabel}
                                field="label"
                                style={{ width: '10px!important' }}
                                defaultWidth={100}
                            />
                        </StyledTable>
                    ) : (
                        <div className="rainbow-p-vertical_xx-large">
                            <h1>
                                Obteniendo Guias <span>{dateListItem}</span>
                            </h1>
                            <div className="rainbow-position_relative rainbow-m-vertical_xx-large rainbow-p-vertical_xx-large">
                                <Spinner size="large" variant="brand" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </StyledAusers>
    );
}
