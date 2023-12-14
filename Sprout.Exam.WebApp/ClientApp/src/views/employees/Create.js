import React, { Component } from 'react';
import authService from '../../components/api-authorization/AuthorizeService';
import { withRouter } from 'react-router-dom';
import Swal from 'sweetalert2';
export class EmployeeCreate extends Component {
    static displayName = EmployeeCreate.name;

    constructor(props) {
        super(props);
                const currentDate = new Date();
        this.minDate = new Date(currentDate);
        this.minDate.setFullYear(currentDate.getFullYear() - 60); // 130 years ago
        this.maxDate = new Date(currentDate);
        this.maxDate.setFullYear(currentDate.getFullYear() - 18); // 18 years ago
        this.state = { fullName: '', birthdate: '', tin: '', typeId: 1, loading: false, loadingSave: false };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        const { name, value } = event.target;
        if (name === 'birthdate') {
            // Handle date input separately
            const parts = value.split('-');
            let updatedValue = `${parts[0]}-${parts[1]}-${parts[2] || ''}`;

            // Restrict the year to four digits
            if (parts[2]) {
                const year = parts[2].slice(0, 4);

                // Check if the year is within the allowed range
                if (year.length === 4) {
                    const numericYear = parseInt(year, 10);

                    // Check if the year is within the specified range
                    if (numericYear >= this.minDate.getFullYear() && numericYear <= this.maxDate.getFullYear()) {
                        updatedValue = `${parts[0]}-${parts[1]}-${year}`;
                    } else {
                        // Display an alert or handle the error condition as needed
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Please enter a valid birth year within the allowed range.',
                        });
                        return;
                    }
                }
            }

            this.setState({ [name]: updatedValue });
            return;
        }
        // Validation for fullName: Allow only letters
        if (name === 'fullName') {
            const sanitizedValue = value.replace(/[^A-Za-z ]/g, ''); // Remove non-letter characters except space
            const truncatedValue = sanitizedValue.slice(0, 50); // Limit to 50 characters
            this.setState({ [name]: truncatedValue });

            if (value.length > 50) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Full Name should not exceed 50 characters.',
                });
            }

            return;
        }

        // Validation for tin: Allow only numbers and hyphens, limit to 12 characters
        if (name === 'tin') {
            const sanitizedValue = value.replace(/[^0-9-]/g, ''); // Remove non-numeric characters except '-'
            const truncatedValue = sanitizedValue.slice(0, 12); // Limit to 12 characters
            this.setState({ [name]: truncatedValue });

            if (value.length > 12) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'TIN should not exceed 12 numbers.',
                });
            }

            return;
        }


        // Convert the value to a decimal for other numeric fields
        const decimalValue = parseFloat(value);

        this.setState({ [name]: decimalValue });
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        if (window.confirm("Are you sure you want to save?")) {
            await this.saveEmployee();
        }
    }

    render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : (
                <div>
                    <form>
                        <div className='form-row'>
                            <div className='form-group col-md-6'>
                                <label htmlFor='inputFullName4'>Full Name: *</label>
                                <input type='text' className='form-control' id='inputFullName4' onChange={this.handleChange.bind(this)} name="fullName" value={this.state.fullName} placeholder='Full Name' />
                            </div>
                            <div className='form-group col-md-6'>
                                <label htmlFor='inputBirthdate4'>Birthdate: *</label>
                                 <input
                                    type='date'
                                    className='form-control'
                                    id='inputBirthdate4'
                                    onChange={this.handleChange}
                                    name="birthdate"
                                    value={this.state.birthdate}
                                    placeholder='Birthdate'
                                    min={this.minDate.toISOString().split('T')[0]} // Format as YYYY-MM-DD
                                    max={this.maxDate.toISOString().split('T')[0]} // Format as YYYY-MM-DD
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className='form-group col-md-6'>
                                <label htmlFor='inputTin4'>TIN: *</label>
                                <input type='text' className='form-control' id='inputTin4' onChange={this.handleChange.bind(this)} value={this.state.tin} name="tin" placeholder='TIN' />
                            </div>
                            <div className='form-group col-md-6'>
                                <label htmlFor='inputEmployeeType4'>Employee Type: *</label>
                                <select id='inputEmployeeType4' onChange={this.handleChange.bind(this)} value={this.state.typeId} name="typeId" className='form-control'>
                                    <option value='1'>Regular</option>
                                    <option value='2'>Contractual</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" onClick={this.handleSubmit} disabled={this.state.loadingSave} className="btn btn-primary mr-2">{this.state.loadingSave ? "Loading..." : "Save"}</button>
                        <button type="button" onClick={() => this.props.history.push("/employees/index")} className="btn btn-primary">Back</button>
                    </form>
                </div>
            );

        return (
            <div>
                <h1 id="tabelLabel">Employee Create</h1>
                <p>All fields are required</p>
                {contents}
            </div>
        );
    }

    async saveEmployee() {
        this.setState({ loadingSave: true });

        try {
            const token = await authService.getAccessToken();
            const requestOptions = {
                method: 'POST',
                headers: !token ? {} : { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(this.state)
            };

            const response = await fetch('api/employees', requestOptions);

            if (response.status === 201) {
                this.setState({ loadingSave: false });
                // Use SweetAlert for success message
                await Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Employee successfully saved!',
                });
                // Redirect to employee index
                this.props.history.push("/employees/index");
            } else {
                // Use SweetAlert for error message
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to save employee.',
                });
            }
        } catch (error) {
            console.error("Error saving employee:", error);
            // Use SweetAlert for error message
            await Swal.fire({
                icon: 'error',
                title: 'System Error',
                text: 'An unexpected error occurred while saving the employee.',
            });
        } finally {
            this.setState({ loadingSave: false });
        }
    }
}
export default withRouter(EmployeeCreate);
