import React, { Component } from 'react';
import './App.css';

class App extends Component {
    constructor(props){
        super(props);
        this.state = {
            response: { users: [] },
            url: 'https://hbc-frontend-challenge.hbccommon.private.hbc.com/coffee-week/users?',
            department: null,
            location: null
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.reshuffle = this.reshuffle.bind(this);
    }

    getEmployees(){
        // fetch employee data from API, set state
        let url = this.state.url;
        if (this.state.department) {
            url += '&department=' + this.state.department;
        }
        if (this.state.location) {
            url += '&location=' + this.state.location;
        }
        fetch(url, {
            method: "GET"
        })
        .then(r => r.json())
        .then((response) => this.setState({response: response}))
        .catch(err => this.setState({response: err}))
    }

    handleInputChange(event){
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
        // TO DO: dynamic filtering for employees by name
    }

    rollCoffeeWeek(employees){
        // for each item in employees, assign them an employee
        if (!employees) {
            return " "
        } else {
            // clone the employees object
            let receivers = JSON.parse(JSON.stringify(employees));
            let pairedEmployees = [];

            employees.forEach((gifter, index) => {
                // associate each gifter with a receiver
                let pair = {
                    ...gifter,
                    "receiver": null
                }


                // recursion test
                if (receivers.length === 1) {
                    pair.receiver = receivers[0];
                    receivers.splice(0,1);
                    pairedEmployees.push(pair);
                    return pairedEmployees;

                }

                (function pairUp(){

                    const receiverIndex = Math.floor(Math.random() * receivers.length);
                    const receiver = receivers[receiverIndex];
                    const alreadyPairedReceiver = pairedEmployees.find( e => e.guid === receiver.guid );


                    if (receiver.guid === gifter.guid) {
                        // don't gift yourself
                        pairUp();

                    } else if ( alreadyPairedReceiver && alreadyPairedReceiver.receiver.guid === gifter.guid ) {
                        // don't gift your gifter
                        pairUp();

                    } else {
                        pair.receiver = receiver;
                        receivers.splice(receiverIndex,1);
                        pairedEmployees.push(pair);
                    }
                })();

            });

            // persist the pairings (would be better in a database)
            localStorage.setItem("paired_employees" + this.state.location + this.state.department, JSON.stringify(pairedEmployees));

            return pairedEmployees.map(
                employee =>
                    <div key={employee.guid} className="pair">
                        <div><strong>{employee.name.first}</strong> should buy a coffee for <strong>{employee.receiver.name.first}</strong></div>
                    </div>
            )

        }

    }

    filterEmployees() {
        let filteredEmployees;
        const employees = this.state.response.users;

        if (!this.state.location || !this.state.department) {
            // need both in order to properly pair up
            return [{"error": "Please make both selections above"}].map(e => <div key={e.error}>{e.error}</div>);
        } else if (this.state.department === "human resources") {
            // HR isn't participating yet, but when they do we can remove this
            return [{"error": "Sorry, human resources isn't participating ...yet!"}].map(e => <div key={e.error}>{e.error}</div>);
        } else if (localStorage.getItem("paired_employees" + this.state.location + this.state.department)) {
            // persist the pairings
            // this would be better stored in a database so all employees had access to the same data
            let existing = JSON.parse(localStorage.getItem("paired_employees" + this.state.location + this.state.department));
            return existing.map(
                employee =>
                    <div key={employee.guid} className="pair">
                        <div><strong>{employee.name.first}</strong> should still buy a coffee for <strong>{employee.receiver.name.first}</strong></div>
                    </div>
            )
        } else {
            filteredEmployees = employees.filter( employee => employee.location === this.state.location );
            filteredEmployees = filteredEmployees.filter( employee => employee.department === this.state.department );
            return this.rollCoffeeWeek(filteredEmployees);
        }

    }

    reshuffle() {
        let location = this.state.location;
        let department = this.state.department;
        localStorage.removeItem("paired_employees" + location + department);
        this.forceUpdate();
    }

    componentDidMount() {
        this.getEmployees();
    }

    render() {
        return (
            <div className="coffee-week">
                <header>
                    <div>
                        <h5>Welcome to Coffee Week</h5>
                    </div>

                </header>
                <nav>
                    <div>
                        <select name="location" onChange={this.handleInputChange}>
                            <option value="">Location:</option>
                            <option value="ny">NY</option>
                            <option value="dub">Dublin</option>
                        </select>
                        <select name="department" onChange={this.handleInputChange}>
                            <option value="">Department:</option>
                            <option value="engineering">Engineering</option>
                            <option value="human resources">Human Resources</option>
                        </select>
                        <button onClick={this.reshuffle}>Re-shuffle</button>
                    </div>

                </nav>
                <section>
                    {this.filterEmployees()}
                </section>
            </div>
        );
    }
}

export default App;
