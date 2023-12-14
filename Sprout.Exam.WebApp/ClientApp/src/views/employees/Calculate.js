import React, { Component } from 'react';
import authService from '../../components/api-authorization/AuthorizeService';
import { withRouter } from 'react-router-dom';
export class EmployeeCalculate extends Component {
    static displayName = EmployeeCalculate.name;

    constructor(props) {
        super(props);
        this.state = { id: 0, fullName: '', birthdate: '', tin: '', typeId: 1, absentDays: 0, workedDays: 0, netIncome: 0, loading: true, loadingCalculate: false };
    }

    componentDidMount() {
        this.getEmployee(this.props.match.params.id);
    }
    handleChange(event) {
        const { name, value } = event.target;
        // Convert the value to a decimal
        const decimalValue = parseFloat(value);
        this.setState({ [name]: decimalValue });
    }


    handleSubmit(e) {
        e.preventDefault();
        this.calculateSalary(this.state.absentDays, this.state.workedDays);
    }

    render() {

        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : <div>
                <form>
                    <div className='form-row'>
                        <div className='form-group col-md-12'>
                            <label>Full Name: <b>{this.state.fullName}</b></label>
                        </div>

                    </div>

                    <div className='form-row'>
                        <div className='form-group col-md-12'>
                            <label>Birthdate: <b>{this.state.birthdate.substring(0, 10)}</b></label>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className='form-group col-md-12'>
                            <label>TIN: <b>{this.state.tin}</b></label>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className='form-group col-md-12'>
                            <label>Employee Type: <b>{this.state.typeId === 1 ? "Regular" : "Contractual"}</b></label>
                        </div>
                    </div>

                    {this.state.typeId === 1 ?
                        <div className="form-row">
                            <div className='form-group col-md-12'><label>Salary: 20000 </label></div>
                            <div className='form-group col-md-12'><label>Tax: 12% </label></div>
                        </div> : <div className="form-row">
                            <div className='form-group col-md-12'><label>Rate Per Day: 500 </label></div>
                        </div>}

                    <div className="form-row">

                        {this.state.typeId === 1 ?
                            <div className='form-group col-md-6'>
                                <label htmlFor='inputAbsentDays4'>Absent Days: </label>
                                <input type='number' step='any' className='form-control' id='inputAbsentDays4' onChange={this.handleChange.bind(this)} value={this.state.absentDays} name="absentDays" placeholder='Absent Days' />
                            </div> :
                            <div className='form-group col-md-6'>
                                <label htmlFor='inputWorkDays4'>Worked Days: </label>
                                <input type='number' step='any' className='form-control' id='inputWorkDays4' onChange={this.handleChange.bind(this)} value={this.state.workedDays} name="workedDays" placeholder='Worked Days' />
                            </div>
                        }
                    </div>

                    <div className="form-row">
                        <div className='form-group col-md-12'>
                            <label>Net Income: <b>{this.state.netIncome}</b></label>
                        </div>
                    </div>

                    <button type="submit" onClick={this.handleSubmit.bind(this)} disabled={this.state.loadingCalculate} className="btn btn-primary mr-2">{this.state.loadingCalculate ? "Loading..." : "Calculate"}</button>
                    <button type="button" onClick={() => this.props.history.push("/employees/index")} className="btn btn-primary">Back</button>
                </form>
            </div>;


        return (
            <div>
                <h1 id="tabelLabel" >Employee Calculate Salary</h1>
                <br />
                {contents}
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
                body: JSON.stringify({ id: this.state.id, absentDays: this.state.absentDays, workedDays: this.state.workedDays })
            };

            const response = await fetch('api/employees/' + this.state.id + '/calculate', requestOptions);

            if (response.status === 200) {
                const data = await response.json();
                this.setState({ netIncome: data });
            } else {
                const errorMessage = (await response.json()).title;
                alert("Controller Error: " + "employee " + errorMessage);
                // Redirect to employee index
                this.props.history.push("/employees/index");
            }
        } catch (error) {
            alert("System Error: " + error);
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
                    text: errorMessage,
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
