using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sprout.Exam.Business.DataTransferObjects;
using Sprout.Exam.Common.Enums;


namespace Sprout.Exam.WebApp.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;

        public EmployeesController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var result = await _employeeService.SelectAllEmployees();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _employeeService.GetEmployeeByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(EditEmployeeDto input)
        {
            var result = await _employeeService.UpdateEmployeeAsync(input);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Post(CreateEmployeeDto input)
        {
            var result = await _employeeService.CreateEmployeeAsync(input);
            return Created($"/api/employees/{result.Id}", result.Id);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _employeeService.DeleteEmployeeAsync(id);
            if (!result) return NotFound();
            return Ok(id);
        }

        [HttpPost("{id}/calculate")]
        public async Task<IActionResult> Calculate(int id, decimal absentDays, decimal workedDays)
        {
            var result = await _employeeService.GetEmployeeByIdAsync(id);
            if (result == null) return NotFound();

            var type = (EmployeeType)result.EmployeeTypeId;
            return type switch
            {
                EmployeeType.Regular => Ok(25000),
                EmployeeType.Contractual => Ok(20000),
                _ => NotFound("Employee Type not found")
            };
        }
    }
}
