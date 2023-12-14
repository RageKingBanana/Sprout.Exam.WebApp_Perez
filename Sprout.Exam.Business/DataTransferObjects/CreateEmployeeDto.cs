using System;
using System.Collections.Generic;
using System.Text;

namespace Sprout.Exam.Business.DataTransferObjects
{
    public class CreateEmployeeDto : BaseSaveEmployeeDto
    {
        public int Id { get; set; }
    }
}
