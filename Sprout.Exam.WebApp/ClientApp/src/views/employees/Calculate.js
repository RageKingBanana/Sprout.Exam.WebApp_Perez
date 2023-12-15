import React, { Component } from 'react';
import authService from '../../components/api-authorization/AuthorizeService';
import { withRouter } from 'react-router-dom';
import Swal from 'sweetalert2';
import { faSave, faBackward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export class EmployeeCalculate extends Component {
    static displayName = EmployeeCalculate.name;

    constructor(props) {
        super(props);
        this.state = {
            id: 0, fullName: '', birthdate: '', tin: '', typeId: 1, absentDays: 0, workedDays: 0, netIncome: 0, loading: true, loadingCalculate: false,
            salary: 20000, // Set a default value for salary
            tax: 12, // Set a default value for tax
            ratePerDay: 500 // Set a default value for ratePerDay
        };
    }

    componentDidMount() {
        this.getEmployee(this.props.match.params.id);
    }
    handleChange(event) {
        const { name, value } = event.target;

        // Convert the value to a decimal
        const decimalValue = parseFloat(value);

        // Validate the input to ensure it's a non-negative number and does not exceed 22
        if (!isNaN(decimalValue) && decimalValue >= 0 && decimalValue <= 22) {
            this.setState({ [name]: decimalValue });
        } else {
            // Use SweetAlert for error message
            Swal.fire({
                icon: 'error',
                title: 'Invalid Input',
                text: 'Please enter a non-negative number not exceeding 22.(There are only 22 work days in a month)',
                confirmButtonText: 'OK',
            });
        }
    }

    handleSalaryChange(event) {
        const { value } = event.target;

        // Convert the value to a decimal
        const decimalValue = parseFloat(value);

        // Validate the input to ensure it's a non-negative number and does not exceed 6 digits
        if (!isNaN(decimalValue) && decimalValue >= 0 && decimalValue <= 999999.99) {
            this.setState({ salary: decimalValue });
        } else {
            // Use SweetAlert for error message
            Swal.fire({
                icon: 'error',
                title: 'Invalid Input',
                text: 'Please enter a non-negative salary not exceeding 6 digits.',
                confirmButtonText: 'OK',
            });
        }
    }

    handleTaxChange(event) {
        const { value } = event.target;

        // Convert the value to a decimal
        const decimalValue = parseFloat(value);

        // Validate the input to ensure it's a number between 1 and 100
        if (!isNaN(decimalValue) && decimalValue >= 1 && decimalValue <= 100) {
            this.setState({ tax: decimalValue });
        } else {
            // Use SweetAlert for error message
            Swal.fire({
                icon: 'error',
                title: 'Invalid Input',
                text: 'Please enter a tax value between 1 and 100.',
                confirmButtonText: 'OK',
            });
        }
    }

    handleRatePerDayChange(event) {
        const { value } = event.target;

        // Convert the value to a decimal
        const decimalValue = parseFloat(value);

        // Validate the input to ensure it's a non-negative number and does not exceed 6 digits
        if (!isNaN(decimalValue) && decimalValue >= 0 && decimalValue <= 999999.99)  {
            this.setState({ ratePerDay: decimalValue });
        } else {
            // Use SweetAlert for error message
            Swal.fire({
                icon: 'error',
                title: 'Invalid Input',
                text: 'Please enter a non-negative rate per day not exceeding 6 digits.',
                confirmButtonText: 'OK',
            });
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Check if absentDays or workedDays is not entered
        if (isNaN(this.state.absentDays) || isNaN(this.state.workedDays)) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please enter the number of days.',
                confirmButtonText: 'OK',
            });
            return;
        }

        this.calculateSalary(this.state.absentDays, this.state.workedDays);
    }

    render() {
        const { fullName, birthdate, tin, typeId, absentDays, workedDays, netIncome, loadingCalculate } = this.state;

        return (
            <div>
                <h1 id="tabelLabel">Employee Calculate Salary</h1>
                <br />
                {this.state.loading ? (
                    <p>
                        <em>Loading...</em>
                    </p>
                ) : (
                    <form>
                        <div className="form-row">
                            <div className="form-group col-md-12">
                                <label>Full Name: <b>{fullName}</b></label>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group col-md-12">
                                <label>Birthdate: <b>{birthdate.substring(0, 10)}</b></label>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group col-md-12">
                                <label>TIN: <b>{tin}</b></label>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group col-md-12">
                                <label>Employee Type: <b>{typeId === 1 ? "Regular" : "Contractual"}</b></label>
                            </div>
                        </div>

                            {typeId === 1 ? (
                                <>
                                    <div className="form-row">
                                        <div className="form-group col-md-12">
                                            <label>Salary: $
                                                <input
                                                    type="number"
                                                    step="any"
                                                    className="form-control"
                                                    onChange={this.handleSalaryChange.bind(this)}
                                                    value={this.state.salary}
                                                    name="salary"
                                                />
                                            </label>
                                        </div>
                                        <div className="form-group col-md-12">
                                            <label>Tax: %
                                                <input
                                                    type="number"
                                                    step="any"
                                                    className="form-control"
                                                    onChange={this.handleTaxChange.bind(this)}
                                                    value={this.state.tax}
                                                    name="tax"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="form-row">
                                    <div className="form-group col-md-12">
                                        <label>Rate Per Day: $
                                            <input
                                                type="number"
                                                step="any"
                                                className="form-control"
                                                onChange={this.handleRatePerDayChange.bind(this)}
                                                value={this.state.ratePerDay}
                                                name="ratePerDay"
                                            />
                                        </label>
                                    </div>
                                </div>

                            )}
                            <div className="form-row">
                                {typeId === 1 ? (
                                    <div className="form-group col-md-6">
                                        <label htmlFor="inputAbsentDays4">Absent Days: </label>
                                        <input
                                            type="number"
                                            step="any"
                                            className="form-control"
                                            id="inputAbsentDays4"
                                            onChange={this.handleChange.bind(this)}
                                            value={Math.max(0, absentDays)} // Ensure non-negative number
                                            name="absentDays"
                                            placeholder="Absent Days"
                                        />
                                    </div>
                                ) : (
                                <div className="form-group col-md-6">
                                    <label htmlFor="inputWorkDays4">Worked Days: </label>
                                    <input
                                        type="number"
                                        step="any"
                                        className="form-control"
                                        id="inputWorkDays4"
                                        onChange={this.handleChange.bind(this)}
                                        value={Math.max(0, workedDays)} // Ensure non-negative number
                                        name="workedDays"
                                        placeholder="Worked Days"
                                    />
                                </div>

                                )}
                            </div>


                        <div className="form-row">
                            <div className="form-group col-md-12">
                                <label>Net Income Per Month: <b>{netIncome}</b></label>
                            </div>
                        </div>

                        <button type="submit" onClick={this.handleSubmit.bind(this)} disabled={this.state.loadingCalculate} className="btn btn-primary mr-2">
                            {this.state.loadingCalculate ? "Loading..." : <FontAwesomeIcon icon={faSave} />} Calculate
                        </button>
                        <button type="button" onClick={() => this.props.history.push("/employees/index")} className="btn btn-primary">
                            <FontAwesomeIcon icon={faBackward} /> Back
                        </button>

                    </form>
                )}
            </div>
        );
    }


    async calculateSalary() {
        this.setState({ loadingCalculate: true });

        try {
            const token = await authService.getAccessToken();
            const requestOptions = {
                method: 'POST',
                headers: !token ? {} : { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'accept': 'application/json' },
                body: JSON.stringify({
                    id: this.state.id,
                    absentDays: this.state.absentDays,
                    workedDays: this.state.workedDays,
                    ratePerDay: this.state.ratePerDay,  // Add ratePerDay
                    salary: this.state.salary,          // Add salary
                    tax: this.state.tax                 // Add tax
                })


            };

            const response = await fetch('api/employees/' + this.state.id + '/calculate', requestOptions);

            if (response.status === 200) {
                const data = await response.json();
                this.setState({ netIncome: data });
                // Your logic to check if netIncome is less than tax and display a SweetAlert
                const taxAmount = 20000 * 0.12;
                if (data === 0 && data < taxAmount) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Notice',
                        text: 'Your net income is less than your tax amount! You will not receive any income!',
                    });
                }
            } else {
                const errorMessage = (await response.json()).title;
                // Use SweetAlert for error message
                await Swal.fire({
                    icon: 'error',
                    title: 'Controller Error',
                    text: 'Employee ' + errorMessage,
                });
                // Redirect to employee index
                this.props.history.push("/employees/index");
            }
        } catch (error) {
            console.error("Error calculating salary:", error);
            // Use SweetAlert for error message
            await Swal.fire({
                icon: 'error',
                title: 'System Error',
                text: 'An unexpected error occurred while calculating the salary.',
            });
            // Redirect to employee index
            this.props.history.push("/employees/index");
        } finally {
            this.setState({ loadingCalculate: false });
        }
    }


    async getEmployee(id) {
        this.setState({ loading: true, loadingCalculate: false });
        const token = await authService.getAccessToken();

        try {
            const response = await fetch('api/employees/' + id, {
                headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 200) {
                const data = await response.json();
                this.setState({ id: data.id, fullName: data.fullName, birthdate: data.birthdate, tin: data.tin, typeId: data.employeeTypeId, loading: false, loadingCalculate: false });
            } else {
                const errorMessage = (await response.json()).title;
                await Swal.fire({
                    icon: 'error',
                    title: 'Controller Error',
                    text: 'Employee ' + errorMessage,
                });
                // Redirect to employee index
                this.props.history.push("/employees/index");
            }
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'System Error',
                text: error.message,
            });
            // Redirect to employee index
            this.props.history.push("/employees/index");
        } finally {
            this.setState({ loading: false, loadingCalculate: false });
        }
    }

}
export default withRouter(EmployeeCalculate);
