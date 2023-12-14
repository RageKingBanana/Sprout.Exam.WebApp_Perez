import React, { Component } from 'react';
import authService from '../../components/api-authorization/AuthorizeService';
import Swal from 'sweetalert2';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEdit, faCalculator, faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withRouter } from 'react-router-dom';

library.add(faEdit, faCalculator, faTrashAlt, faPlus);
export class EmployeesIndex extends Component {
    static displayName = EmployeesIndex.name;

    constructor(props) {
        super(props);
        this.state = { employees: [], loading: true };
    }

    componentDidMount() {
        this.populateEmployeeData();
    }
    static renderEmployeesTable(employees, parent) {
        return (
            <table className='table table-striped table-bordered' aria-labelledby="tabelLabel">
                <thead className='thead-dark'>
                    <tr>
                        <th>Full Name</th>
                        <th>Birthdate</th>
                        <th>TIN</th>
                        <th>Type</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map(employee =>
                        <tr key={employee.id}>
                            <td>{employee.fullName}</td>
                            <td>{new Date(employee.birthdate).toLocaleDateString()}</td>
                            <td>{employee.tin}</td>
                            <td>{employee.employeeTypeId === 1 ? "Regular" : "Contractual"}</td>
                            <td>
                                <button type='button' className='btn btn-info mr-2' onClick={() => parent.redirectToEdit(employee.id)}>
                                    <FontAwesomeIcon icon="edit" /> Edit
                                </button>
                                <button type='button' className='btn btn-primary mr-2' onClick={() => parent.props.history.push("/employees/" + employee.id + "/calculate")}>
                                    <FontAwesomeIcon icon="calculator" /> Calculate
                                </button>
                                <button type='button' className='btn btn-danger' onClick={() => {
                                    if (window.confirm("Are you sure you want to delete?")) {
                                        parent.deleteEmployee(employee.id);
                                    }
                                }}>
                                    <FontAwesomeIcon icon="trash-alt" /> Delete
                                </button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    }

    render() {
        let contents = this.state.loading
            ? <p className="text-center"><em>Loading...</em></p>
            : EmployeesIndex.renderEmployeesTable(this.state.employees, this);

        return (
            <div className="container mt-4">
                <h1 className="text-center">Employees</h1>
                <p className="text-center">This page should fetch data from the server.</p>
                <button type='button' className='btn btn-success mb-3' onClick={() => this.props.history.push("/employees/create")}>
                    <FontAwesomeIcon icon="plus" /> Create
                </button>
                {contents}
            </div>
        );
    }

    async populateEmployeeData() {
        const token = await authService.getAccessToken();
        const response = await fetch('api/employees', {
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        this.setState({ employees: data, loading: false });
    }

    async deleteEmployee(id) {
        const token = await authService.getAccessToken();
        const requestOptions = {
            method: 'DELETE',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        };

        try {
            const response = await fetch('api/employees/' + id, requestOptions);

            if (response.status === 200) {
                this.setState({
                    employees: this.state.employees.filter(function (employee) {
                        return employee.id !== id;
                    })
                });

                // Use SweetAlert for success message
                await Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Employee successfully deleted!',
                });
            } else {
                // Use SweetAlert for error message
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'There was an error occurred.',
                });
            }
        } catch (error) {
            console.error("Error deleting employee:", error);
            // Use SweetAlert for error message
            await Swal.fire({
                icon: 'error',
                title: 'System Error',
                text: 'An unexpected error occurred while deleting the employee.',
            });
        } finally {
            // Reload the employee data
            await this.populateEmployeeData();
        }
    }

    redirectToEdit = (employeeId) => {
        const { history } = this.props;
        history.push(`/employees/${employeeId}/edit`);
    };

}
export default withRouter(EmployeesIndex);

