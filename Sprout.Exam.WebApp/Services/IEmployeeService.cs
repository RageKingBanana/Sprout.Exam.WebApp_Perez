using System.Collections.Generic;
using System.Threading.Tasks;
using Sprout.Exam.Business.DataTransferObjects;
using Sprout.Exam.WebApp.Models;

public interface IEmployeeService
{
    Task<IEnumerable<EmployeeDTO>> SelectAllEmployees();
    Task<EmployeeDTO> GetEmployeeByIdAsync(int id);
    Task<EmployeeDTO> UpdateEmployeeAsync(EditEmployeeDto input);
    //Task<EmployeeDTO> CreateEmployeeAsync(CreateEmployeeDto input);
    Task<bool> DeleteEmployeeAsync(int id);
    Task<string> CreateEmployeeAsync(CreateEmployeeDto input);
}
